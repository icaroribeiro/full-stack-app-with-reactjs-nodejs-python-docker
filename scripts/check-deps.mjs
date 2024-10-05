import depcheck from "depcheck";
import fs from "fs";
import path from "path";

const appsPath = path.resolve(import.meta.dirname, "..", "apps");
const packagesPath = path.resolve(import.meta.dirname, "..", "packages");

function listPackages(inputPath) {
	const packages = [];
	const dirs = fs.readdirSync(inputPath);
	for (const dir of dirs) {
		const packagePath = path.resolve(inputPath, dir);
		const packageJsonPath = path.resolve(packagePath, "package.json");
		try {
			const stats = fs.statSync(packageJsonPath);
			if (stats.isFile()) {
				const packageJson = JSON.parse(
					fs.readFileSync(packageJsonPath, "utf8")
				);
				packages.push({ name: packageJson.name, path: packagePath });
			}
		} catch (e) {}
	}
	return packages;
}

async function checkPackage(pkg) {
	const result = await depcheck(pkg.path, { ignoreMatches: [] });
	const report = [];
	if (result.dependencies.length > 0) {
		report.push(`Unused dependencies:`);
		for (const dep of result.dependencies) {
			report.push(`  * ${dep}`);
		}
	}
	if (result.devDependencies.length > 0) {
		report.push(`Unused devDependencies:`);
		for (const dep of result.devDependencies) {
			report.push(`  * ${dep}`);
		}
	}
	const missing = [...Object.entries(result.missing)];
	if (missing.length > 0) {
		report.push(`Missing dependencies:`);
		for (const [dep, usages] of missing) {
			report.push(`  * ${dep} (${usages.length} usages)`);
		}
	}
	const invalidFiles = [...Object.keys(result.invalidFiles)];
	if (invalidFiles.length > 0) {
		report.push(`Invalid files:`);
		for (const file of invalidFiles) {
			report.push(`  * ${file}`);
		}
	}
	const invalidDirs = [...Object.keys(result.invalidDirs)];
	if (invalidDirs.length > 0) {
		report.push(`Invalid directories:`);
		for (const dir of invalidDirs) {
			report.push(`  * ${dir}`);
		}
	}
	if (report.length > 0) {
		console.log(`--- Package ${pkg.name} ---`);
		console.log(report.join("\n"));
		console.log(`--- End of Package ${pkg.name} ---\n`);
	}
}

const appsPackages = listPackages(appsPath);
const packagePackages = listPackages(packagesPath);
const allPackages = appsPackages;
allPackages.concat(packagePackages);
await Promise.allSettled(allPackages.map(checkPackage));
