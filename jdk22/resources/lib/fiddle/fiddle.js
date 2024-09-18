var GraalVMFiddle = (function() {
    'use strict';

    let promise;

    function init() {
        if(!promise) {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = GraalVMFiddle.path + 'fiddle-main.js';
            promise = new Promise((resolve, reject) => { script.onload = resolve; script.onerror = reject; });
            document.head.appendChild(script);
        }
        return promise;
    }

    return {
        path: document.currentScript.src.replace(/[^/]*$/, ''),
        replace: async (...args) => {
            await init();
            GraalVMFiddle.replace(...args);
        },
    };
})();
