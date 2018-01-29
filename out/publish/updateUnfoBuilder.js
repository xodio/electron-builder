"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.writeUpdateInfo = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

/** @internal */
let writeUpdateInfo = exports.writeUpdateInfo = (() => {
    var _ref = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (event, _publishConfigs) {
        const packager = event.packager;
        const publishConfigs = yield (0, (_PublishManager || _load_PublishManager()).getPublishConfigsForUpdateInfo)(packager, _publishConfigs, event.arch);
        if (publishConfigs == null || publishConfigs.length === 0) {
            return;
        }
        const target = event.target;
        const outDir = target.outDir;
        const version = packager.appInfo.version;
        const sha2 = new (_lazyVal || _load_lazyVal()).Lazy(function () {
            return (0, (_builderUtil || _load_builderUtil()).hashFile)(event.file, "sha256", "hex");
        });
        const isMac = packager.platform === (_core || _load_core()).Platform.MAC;
        const releaseInfo = Object.assign({}, packager.config.releaseInfo);
        if (releaseInfo.releaseNotes == null) {
            const releaseNotesFile = yield packager.getResource(releaseInfo.releaseNotesFile, "release-notes.md");
            const releaseNotes = releaseNotesFile == null ? null : yield (0, (_fsExtraP || _load_fsExtraP()).readFile)(releaseNotesFile, "utf-8");
            // to avoid undefined in the file, check for null
            if (releaseNotes != null) {
                releaseInfo.releaseNotes = releaseNotes;
            }
        }
        delete releaseInfo.releaseNotesFile;
        const createdFiles = new Set();
        const sharedInfo = yield createUpdateInfo(version, event, releaseInfo);
        for (let publishConfig of publishConfigs) {
            let info = sharedInfo;
            if (publishConfig.provider === "bintray") {
                continue;
            }
            if (publishConfig.provider === "github" && "releaseType" in publishConfig) {
                publishConfig = Object.assign({}, publishConfig);
                delete publishConfig.releaseType;
            }
            const channel = publishConfig.channel || "latest";
            let dir = outDir;
            if (publishConfigs.length > 1 && publishConfig !== publishConfigs[0]) {
                dir = _path.join(outDir, publishConfig.provider);
            }
            // spaces is a new publish provider, no need to keep backward compatibility
            const isElectronUpdater1xCompatibility = publishConfig.provider !== "spaces";
            if (isMac && isElectronUpdater1xCompatibility) {
                yield writeOldMacInfo(publishConfig, outDir, dir, channel, createdFiles, version, packager);
            }
            const updateInfoFile = _path.join(dir, `${channel}${isMac ? "-mac" : ""}.yml`);
            if (createdFiles.has(updateInfoFile)) {
                continue;
            }
            createdFiles.add(updateInfoFile);
            // noinspection JSDeprecatedSymbols
            if (isElectronUpdater1xCompatibility && packager.platform === (_core || _load_core()).Platform.WINDOWS && info.sha2 == null) {
                // backward compatibility
                info.sha2 = yield sha2.value;
            }
            if (event.safeArtifactName != null && publishConfig.provider === "github") {
                info = Object.assign({}, info, { githubArtifactName: event.safeArtifactName });
            }
            yield (0, (_fsExtraP || _load_fsExtraP()).outputFile)(updateInfoFile, (0, (_jsYaml || _load_jsYaml()).safeDump)(info));
            // artifact should be uploaded only to designated publish provider
            packager.info.dispatchArtifactCreated({
                file: updateInfoFile,
                arch: null,
                packager,
                target: null,
                publishConfig
            });
        }
    });

    return function writeUpdateInfo(_x, _x2) {
        return _ref.apply(this, arguments);
    };
})();

let createUpdateInfo = (() => {
    var _ref2 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (version, event, releaseInfo) {
        const info = Object.assign({ version, releaseDate: new Date().toISOString(), path: _path.basename(event.file), sha512: yield (0, (_builderUtil || _load_builderUtil()).hashFile)(event.file) }, releaseInfo);
        const packageFiles = event.packageFiles;
        if (packageFiles != null) {
            const keys = Object.keys(packageFiles);
            if (keys.length > 0) {
                info.packages = {};
                for (const arch of keys) {
                    const packageFileInfo = packageFiles[arch];
                    info.packages[arch] = Object.assign({}, packageFileInfo, { file: _path.basename(packageFileInfo.file) });
                }
            }
        }
        return info;
    });

    return function createUpdateInfo(_x3, _x4, _x5) {
        return _ref2.apply(this, arguments);
    };
})();
// backward compatibility - write json file


let writeOldMacInfo = (() => {
    var _ref3 = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (publishConfig, outDir, dir, channel, createdFiles, version, packager) {
        const isGitHub = publishConfig.provider === "github";
        const updateInfoFile = isGitHub && outDir === dir ? _path.join(dir, "github", `${channel}-mac.json`) : _path.join(dir, `${channel}-mac.json`);
        if (!createdFiles.has(updateInfoFile)) {
            createdFiles.add(updateInfoFile);
            yield (0, (_fsExtraP || _load_fsExtraP()).outputJson)(updateInfoFile, {
                version,
                releaseDate: new Date().toISOString(),
                url: (0, (_PublishManager || _load_PublishManager()).computeDownloadUrl)(publishConfig, packager.generateName2("zip", "mac", isGitHub), packager)
            }, { spaces: 2 });
            packager.info.dispatchArtifactCreated({
                file: updateInfoFile,
                arch: null,
                packager,
                target: null,
                publishConfig
            });
        }
    });

    return function writeOldMacInfo(_x6, _x7, _x8, _x9, _x10, _x11, _x12) {
        return _ref3.apply(this, arguments);
    };
})();
//# sourceMappingURL=updateUnfoBuilder.js.map


var _builderUtil;

function _load_builderUtil() {
    return _builderUtil = require("builder-util");
}

var _fsExtraP;

function _load_fsExtraP() {
    return _fsExtraP = require("fs-extra-p");
}

var _jsYaml;

function _load_jsYaml() {
    return _jsYaml = require("js-yaml");
}

var _lazyVal;

function _load_lazyVal() {
    return _lazyVal = require("lazy-val");
}

var _path = _interopRequireWildcard(require("path"));

var _core;

function _load_core() {
    return _core = require("../core");
}

var _PublishManager;

function _load_PublishManager() {
    return _PublishManager = require("./PublishManager");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }