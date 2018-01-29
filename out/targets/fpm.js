"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _bluebirdLst2;

function _load_bluebirdLst2() {
    return _bluebirdLst2 = _interopRequireDefault(require("bluebird-lst"));
}

let writeConfigFile = (() => {
    var _ref = (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* (tmpDir, templatePath, options) {
        //noinspection JSUnusedLocalSymbols
        function replacer(match, p1) {
            if (p1 in options) {
                return options[p1];
            } else {
                throw new Error(`Macro ${p1} is not defined`);
            }
        }
        const config = (yield (0, (_fsExtraP || _load_fsExtraP()).readFile)(templatePath, "utf8")).replace(/\${([a-zA-Z]+)}/g, replacer).replace(/<%=([a-zA-Z]+)%>/g, function (match, p1) {
            (0, (_builderUtil || _load_builderUtil()).warn)("<%= varName %> is deprecated, please use ${varName} instead");
            return replacer(match, p1.trim());
        });
        const outputPath = yield tmpDir.getTempFile({ suffix: _path.basename(templatePath, ".tpl") });
        yield (0, (_fsExtraP || _load_fsExtraP()).outputFile)(outputPath, config);
        return outputPath;
    });

    return function writeConfigFile(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
    };
})();
//# sourceMappingURL=fpm.js.map


var _zipBin;

function _load_zipBin() {
    return _zipBin = require("7zip-bin");
}

var _builderUtil;

function _load_builderUtil() {
    return _builderUtil = require("builder-util");
}

var _binDownload;

function _load_binDownload() {
    return _binDownload = require("builder-util/out/binDownload");
}

var _bundledTool;

function _load_bundledTool() {
    return _bundledTool = require("builder-util/out/bundledTool");
}

var _fs;

function _load_fs() {
    return _fs = require("builder-util/out/fs");
}

var _fsExtraP;

function _load_fsExtraP() {
    return _fsExtraP = require("fs-extra-p");
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

var _errorMessages;

function _load_errorMessages() {
    return _errorMessages = _interopRequireWildcard(require("../errorMessages"));
}

var _pathManager;

function _load_pathManager() {
    return _pathManager = require("../util/pathManager");
}

var _LinuxTargetHelper;

function _load_LinuxTargetHelper() {
    return _LinuxTargetHelper = require("./LinuxTargetHelper");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

const fpmPath = new (_lazyVal || _load_lazyVal()).Lazy(() => {
    if (process.platform === "win32" || process.env.USE_SYSTEM_FPM === "true") {
        return (_bluebirdLst2 || _load_bluebirdLst2()).default.resolve("fpm");
    }
    const osAndArch = process.platform === "darwin" ? "mac" : `linux-x86${process.arch === "ia32" ? "" : "_64"}`;
    if (process.platform === "darwin") {
        //noinspection SpellCheckingInspection
        return (0, (_binDownload || _load_binDownload()).getBinFromGithub)("fpm", "1.9.2.1-20150715-2.2.2-mac", "6sZZoRKkxdmv3a6E5dnZgVl23apGnImhDtGHKhgCE1WOtXBUJnx+w0WvB2HD2/sitz4f93Mf7+QqDCIbfP7LOw==").then(it => _path.join(it, "fpm"));
    }
    //noinspection SpellCheckingInspection
    const checksum = process.arch === "ia32" ? "cTT/HdjrQ6qTJQhTZaZC3lyDkRCyNFtNBZ0F7n6mh5B3YmD5ttJZ0xn65pQS03dhEi67A8K1xXNO+tyEEviiIg==" : "0zKxWlHuQEUsXJpWll5Bc4OTI8d0jcMVlme9OeHI+Y+s3sv1S4KyGLOEVEkNw6pRU8F+A1Dj5IR95/+U8YzB0A==";
    return (0, (_binDownload || _load_binDownload()).getBinFromGithub)("fpm", `1.9.2-2.3.1-${osAndArch}`, checksum).then(it => _path.join(it, "fpm"));
});
class FpmTarget extends (_core || _load_core()).Target {
    constructor(name, packager, helper, outDir) {
        super(name, false);
        this.packager = packager;
        this.helper = helper;
        this.outDir = outDir;
        this.options = Object.assign({}, this.packager.platformSpecificBuildOptions, this.packager.config[this.name]);
        this.scriptFiles = this.createScripts();
    }
    createScripts() {
        var _this = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const defaultTemplatesDir = (0, (_pathManager || _load_pathManager()).getTemplatePath)("linux");
            const packager = _this.packager;
            const templateOptions = Object.assign({
                // old API compatibility
                executable: packager.executableName, productFilename: packager.appInfo.productFilename }, packager.platformSpecificBuildOptions);
            function getResource(value, defaultFile) {
                if (value == null) {
                    return _path.join(defaultTemplatesDir, defaultFile);
                }
                return _path.resolve(packager.projectDir, value);
            }
            return yield (_bluebirdLst2 || _load_bluebirdLst2()).default.all([writeConfigFile(packager.info.tempDirManager, getResource(_this.options.afterInstall, "after-install.tpl"), templateOptions), writeConfigFile(packager.info.tempDirManager, getResource(_this.options.afterRemove, "after-remove.tpl"), templateOptions)]);
        })();
    }
    build(appOutDir, arch) {
        var _this2 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const target = _this2.name;
            (0, (_builderUtil || _load_builderUtil()).log)(`Building ${target}`);
            // tslint:disable:no-invalid-template-strings
            let nameFormat = "${name}-${version}-${arch}.${ext}";
            let isUseArchIfX64 = false;
            if (target === "deb") {
                nameFormat = "${name}_${version}_${arch}.${ext}";
                isUseArchIfX64 = true;
            } else if (target === "rpm") {
                nameFormat = "${name}-${version}.${arch}.${ext}";
                isUseArchIfX64 = true;
            }
            const destination = _path.join(_this2.outDir, _this2.packager.expandArtifactNamePattern(_this2.options, target, arch, nameFormat, !isUseArchIfX64));
            yield (0, (_fs || _load_fs()).unlinkIfExists)(destination);
            if (_this2.packager.packagerOptions.prepackaged != null) {
                yield (0, (_fsExtraP || _load_fsExtraP()).ensureDir)(_this2.outDir);
            }
            const scripts = yield _this2.scriptFiles;
            const packager = _this2.packager;
            const appInfo = packager.appInfo;
            const projectUrl = yield appInfo.computePackageUrl();
            if (projectUrl == null) {
                throw new Error("Please specify project homepage, see https://electron.build/configuration/configuration#Metadata-homepage");
            }
            const options = _this2.options;
            let author = options.maintainer;
            if (author == null) {
                const a = packager.info.metadata.author;
                if (a.email == null) {
                    throw new Error((_errorMessages || _load_errorMessages()).authorEmailIsMissed);
                }
                author = `${a.name} <${a.email}>`;
            }
            const synopsis = options.synopsis;
            const args = ["-s", "dir", "-t", target, "--architecture", target === "pacman" && arch === (_builderUtil || _load_builderUtil()).Arch.ia32 ? "i686" : (0, (_builderUtil || _load_builderUtil()).toLinuxArchString)(arch), "--name", appInfo.name, "--force", "--after-install", scripts[0], "--after-remove", scripts[1], "--description", (0, (_builderUtil || _load_builderUtil()).smarten)(target === "rpm" ? _this2.helper.getDescription(options) : `${synopsis || ""}\n ${_this2.helper.getDescription(options)}`), "--maintainer", author, "--vendor", options.vendor || author, "--version", appInfo.version, "--package", destination, "--url", projectUrl];
            if ((_builderUtil || _load_builderUtil()).debug.enabled) {
                args.push("--log", "debug", "--debug");
            }
            const packageCategory = options.packageCategory;
            if (packageCategory != null && packageCategory !== null) {
                args.push("--category", packageCategory);
            }
            if (target === "deb") {
                args.push("--deb-compression", options.compression || "xz");
                (0, (_builderUtil || _load_builderUtil()).use)(options.priority, function (it) {
                    return args.push("--deb-priority", it);
                });
            } else if (target === "rpm") {
                args.push("--rpm-os", "linux");
                if (synopsis != null) {
                    args.push("--rpm-summary", (0, (_builderUtil || _load_builderUtil()).smarten)(synopsis));
                }
            }
            // noinspection JSDeprecatedSymbols
            let depends = options.depends || _this2.packager.platformSpecificBuildOptions.depends;
            if (depends == null) {
                if (target === "deb") {
                    depends = ["gconf2", "gconf-service", "libnotify4", "libappindicator1", "libxtst6", "libnss3", "libxss1"];
                } else if (target === "pacman") {
                    // noinspection SpellCheckingInspection
                    depends = ["c-ares", "ffmpeg", "gtk3", "http-parser", "libevent", "libvpx", "libxslt", "libxss", "minizip", "nss", "re2", "snappy", "libnotify", "libappindicator-gtk2", "libappindicator-gtk3", "libappindicator-sharp"];
                } else if (target === "rpm") {
                    depends = ["libnotify", "libappindicator"];
                } else {
                    depends = [];
                }
            } else if (!Array.isArray(depends)) {
                if (typeof depends === "string") {
                    depends = [depends];
                } else {
                    throw new Error(`depends must be Array or String, but specified as: ${depends}`);
                }
            }
            for (const dep of depends) {
                args.push("--depends", dep);
            }
            (0, (_builderUtil || _load_builderUtil()).use)(packager.info.metadata.license, function (it) {
                return args.push("--license", it);
            });
            (0, (_builderUtil || _load_builderUtil()).use)(appInfo.buildNumber, function (it) {
                return args.push("--iteration", it);
            });
            (0, (_builderUtil || _load_builderUtil()).use)(options.fpm, function (it) {
                return args.push.apply(args, _toConsumableArray(it));
            });
            args.push(`${appOutDir}/=${(_LinuxTargetHelper || _load_LinuxTargetHelper()).installPrefix}/${appInfo.productFilename}`);
            for (const icon of yield _this2.helper.icons) {
                args.push(`${icon.file}=/usr/share/icons/hicolor/${icon.size}x${icon.size}/apps/${packager.executableName}.png`);
            }
            const desktopFilePath = yield _this2.helper.writeDesktopEntry(_this2.options);
            args.push(`${desktopFilePath}=/usr/share/applications/${_this2.packager.executableName}.desktop`);
            if (_this2.packager.packagerOptions.effectiveOptionComputed != null && (yield _this2.packager.packagerOptions.effectiveOptionComputed([args, desktopFilePath]))) {
                return;
            }
            const env = Object.assign({}, process.env, { FPM_COMPRESS_PROGRAM: (_zipBin || _load_zipBin()).path7x, SZA_PATH: (_zipBin || _load_zipBin()).path7za, SZA_COMPRESSION_LEVEL: packager.config.compression === "store" ? "0" : "9" });
            // rpmbuild wants directory rpm with some default config files. Even if we can use dylibbundler, path to such config files are not changed (we need to replace in the binary)
            // so, for now, brew install rpm is still required.
            if (target !== "rpm" && (yield (0, (_builderUtil || _load_builderUtil()).isMacOsSierra)())) {
                const linuxToolsPath = yield (0, (_bundledTool || _load_bundledTool()).getLinuxToolsPath)();
                Object.assign(env, {
                    PATH: (0, (_bundledTool || _load_bundledTool()).computeEnv)(process.env.PATH, [_path.join(linuxToolsPath, "bin")]),
                    DYLD_LIBRARY_PATH: (0, (_bundledTool || _load_bundledTool()).computeEnv)(process.env.DYLD_LIBRARY_PATH, [_path.join(linuxToolsPath, "lib")])
                });
            }
            yield (0, (_builderUtil || _load_builderUtil()).exec)((yield fpmPath.value), args, { env });
            _this2.packager.dispatchArtifactCreated(destination, _this2, arch);
        })();
    }
}
exports.default = FpmTarget;