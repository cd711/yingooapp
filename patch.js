const fs =require("fs");
const path = require('path');
const cp = require('child_process');

const ignore = [
    '/components/iconfont/',
]
function removeQss(currentDirPath) {
    fs.readdir(currentDirPath, function (err, files) {
        if (err) {
            throw new Error(err);
        }
        files.forEach(function (name) {
            const filePath = path.join(currentDirPath, name);
            const stat = fs.statSync(filePath);
            if (stat.isFile()) {
                if (name.endsWith(".qss")) {
                    for (const ig of ignore) {
                        if (filePath.indexOf(ig) > 0) {
                            return;
                        }
                    }
                    console.log("remove", filePath);
                    fs.unlinkSync(filePath);
                }
            } else if (stat.isDirectory()) {
                removeQss(filePath);
            }
        });
    });
}

function copyWxss(currentDirPath) {
    fs.readdir(currentDirPath, function (err, files) {
        if (err) {
            throw new Error(err);
        }
        files.forEach(function (name) {
            const filePath = path.join(currentDirPath, name);
            const stat = fs.statSync(filePath);
            if (stat.isFile()) {
                if (name.endsWith(".wxss")) {
                    for (const ig of ignore) {
                        if (filePath.indexOf(ig) > 0) {
                            return;
                        }
                    }
                    console.log("copy", filePath);
                    try {
                    fs.copyFileSync(filePath, filePath.replace("/dist/weapp/", "/dist/qq/"));
                    } catch(e) {
                        console.warn(e);
                    }
                }
            } else if (stat.isDirectory()) {
                copyWxss(filePath);
            }
        });
    });
}
const wxPath = path.join(__dirname, "./dist/weapp");
const outPath = path.join(__dirname, './dist/qq');



removeQss(outPath);
copyWxss(wxPath);