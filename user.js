// ==UserScript==
// @name         Soundcloud Anti Repost
// @version      1.2
// @author       Redcrafter
// @description  Remove reposts from soundcloud
// @license      MIT
// @include      https://soundcloud.com/stream
// @run-at       document-end
// @namespace    https://github.com/Redcrafter/
// ==/UserScript==

function removeReposts() {
    for (const item of document.querySelectorAll(".soundList__item")) {
        if (item.querySelector(".soundContext__repost")) {
            item.remove();
        }
    }
}

function replaceModule(key, oldModule) {
    newModules[key] = (e, t, r) => {
        oldModule(e, t, r);
        let oldExp = e.exports;

        e.exports = (asdf) => {
            let playManager = oldExp(asdf);

            let oldSet = playManager.setCurrentItem;
            playManager.setCurrentItem = (e) => {
                let r = false;

                try {
                    // Not sure if this safe
                    r = e._submodels[0]._events["change:user"][1].context.options.actionType === "repost";
                } catch (error) {
                    // console.error("An Exception occoured while trying to determine repost status");
                }

                if (r) {
                    playManager.removeItem(e);
                    playManager.playNext();
                } else {
                    oldSet(e);
                }
            };

            return temp;
        }
    }
}

setInterval(removeReposts, 500);

let newModules = {};

// find player module
for (const item of webpackChunk) {
    for (const key in item[1]) {

        // probably not safe
        if (key === "86616") {
            replaceModule(key, item[1][key]);
        }
    }
}

// replace player module
unsafeWindow.webpackChunk.push([[1234], newModules]);
