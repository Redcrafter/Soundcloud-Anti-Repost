// ==UserScript==
// @name         Soundcloud Anti Repost
// @version      1.0
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

let playManager;

// Partly taken from https://github.com/web-scrobbler/web-scrobbler/blob/master/src/connectors/soundcloud-dom-inject.js
// Searches for the playerManager module
unsafeWindow.webpackJsonp([], {
    0: function (e, t, _require) {
        let modules = _require.c;

        for (let moduleid in modules) {
            if (modules.hasOwnProperty(moduleid)) {
                let el = _require(moduleid);

                if (typeof el.playCurrent === 'function') {
                    playManager = el;
                    return;
                }
            }
        }
    }
});

if (!playManager) {
    throw new Error("Unable to find playManager.");
} else {
    // Inject a function to check for reposts
    let oldSet = playManager.setCurrentItem;
    playManager.setCurrentItem = (e) => {
        let r = false;
        try {
            // Not sure if this safe
            r = e._submodels[0]._events["change:user"][1].context.options.actionType === "repost";
        } catch (error) {
            console.error("An Exception occoured while trying to determine repost status");
        }
        
        if (r) {
            playManager.removeItem(e);
            playManager.playNext();
        } else {
            oldSet(e);
        }
    };

    setInterval(removeReposts, 500);
}