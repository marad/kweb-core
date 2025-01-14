function toWSUrl(s) {
    let l = window.location;
    return (l.protocol === "https:" ? "wss://" : "ws://") + l.host + "/" + s;
}

let kwebClientId = "--CLIENT-ID-PLACEHOLDER--";
let websocketEstablished = false;
let preWSMsgQueue = [];
let socket;

function handleInboundMessage(msg) {
    console.debug("")
    const yourId = msg["yourId"];
    const debugToken = msg["debugToken"];
    if (kwebClientId != yourId) {
        console.error(
            "Received message from incorrect clientId, was " +
            yourId +
            ", should be " +
            kwebClientId
        );
    }
    const execute = msg["execute"];
    if (execute !== undefined) {
        try {
            eval(execute["js"]);
            console.debug("Executed JavaScript", execute["js"]);
        } catch (err) {
            if (debugToken != undefined) {
                console.error("Error evaluating [" + execute["js"] + "] : " + err);
                var error = {
                    debugToken: debugToken,
                    error: {name: err.name, message: err.message}
                };
                var message = {id: kwebClientId, error: error};
                sendMessage(JSON.stringify(message));
            } else {
                throw err;
            }
        }
    }
    let evaluate = msg["evaluate"];
    if (evaluate !== undefined) {
        try {
            const data = eval(evaluate["js"]);
            console.debug("Evaluated [" + evaluate["js"] + "]", data);
            const callback = {callbackId: evaluate["callbackId"], data: data};
            const message = {id: kwebClientId, callback: callback};
            sendMessage(JSON.stringify(message));
        } catch (err) {
            if (debugToken != undefined) {
                console.error("Error evaluating `" + evaluate["js"] + "`: " + err);
                const error = {
                    debugToken: debugToken,
                    error: {name: err.name, message: err.message}
                };
                const message = {id: kwebClientId, error: error};
                sendMessage(JSON.stringify(message));
            } else {
                throw err;
            }
        }
    }
    const instructions = msg["instructions"];
    if (instructions !== undefined) {
        for (let i = 0; i < instructions.length; i++) {
            const instruction = instructions[i];
            if (instruction.type === "SetAttribute") {
                document
                    .getElementById(instruction.parameters[0])
                    .setAttribute(instruction.parameters[1], instruction.parameters[2]);
            } else if (instruction.type === "RemoveAttribute") {
                const id = instruction.parameters[0];
                const attribute = instruction.parameters[1];
                document.getElementById(id).removeAttribute(attribute);
            } else if (instruction.type === "CreateElement") {
                const tag = instruction.parameters[0];
                const attributes = instruction.parameters[1];
                const myId = instruction.parameters[2];
                const parentId = instruction.parameters[3];
                const position = instruction.parameters[4];
                const newEl = document.createElement(tag);
                newEl.setAttribute("id", myId);
                for (const key in attributes) {
                    if (key !== "id") {
                        newEl.setAttribute(key, attributes[key]);
                    }
                }

                let parentElement = document.getElementById(parentId);

                if (position > -1) {
                    parentElement.insertBefore(newEl, parentElement.children[position]);
                } else {
                    parentElement.appendChild(newEl);
                }
            } else if (instruction.type === "AddText") {
                const id = instruction.parameters[0];
                const text = instruction.parameters[1];
                const textNode = document.createTextNode(text);
                document.getElementById(id).appendChild(textNode);
            } else if (instruction.type === "SetText") {
                const id = instruction.parameters[0];
                const text = instruction.parameters[1];
                document.getElementById(id).textContent = text
            }
        }
    }
}

function connectWs() {
    var wsURL = toWSUrl("ws");
    console.debug("Establishing websocket connection", wsURL);
    socket = new WebSocket(wsURL);
    if (window.WebSocket === undefined) {
        document.body.innerHTML =
            "<h1>Unfortunately this website requires a browser that supports websockets (all modern browsers do)</h1>";
        console.error("Browser doesn't support window.WebSocket");
    } else {
        socket.onopen = function () {
            console.debug("socket.onopen event received");
            websocketEstablished = true;
            console.debug("Websocket established", wsURL);
            sendMessage(JSON.stringify({id: kwebClientId, hello: true}));
            while (preWSMsgQueue.length > 0) {
                sendMessage(preWSMsgQueue.shift());
            }
        };
        socket.onmessage = function (event) {
            var msg = JSON.parse(event.data);
            console.debug("Message received from socket: ", event.data);
            handleInboundMessage(msg);
        };

        socket.onclose = function (evt) {
            console.debug("Socket closed");
            var explanation = "";
            if (evt.reason && evt.reason.length > 0) {
                explanation = "reason: " + evt.reason;
            } else {
                explanation = "without a reason specified";
            }

            console.error("WebSocket was closed", explanation, evt);
            websocketEstablished = false;
            if (evt.wasClean) {
                console.warn("Attempting reconnect...")
                connectWs()
            } else {
                console.warn("Forcing page reload");
                location.reload(true);
            }
        };
        socket.onerror = function (evt) {
            console.error("WebSocket error", evt);
            websocketEstablished = false;
            console.warn("Forcing page reload");
            location.reload(true);
        };
    }
}

function sendMessage(msg) {
    if (websocketEstablished) {
        console.debug("Sending WebSocket message", msg);
        socket.send(msg);
    } else {
        console.debug(
            "Queueing WebSocket message as connection isn't established",
            msg
        );
        preWSMsgQueue.push(msg);
    }
}

function callbackWs(callbackId, data) {
    var msg = JSON.stringify({
        id: kwebClientId,
        callback: {callbackId: callbackId, data: JSON.stringify(data)}
    });
    sendMessage(msg);
}

/*
 * Utility functions
 */
function hasClass(el, className) {
    if (el.classList) return el.classList.contains(className);
    else
        return !!el.className.render(new RegExp("(\\s|^)" + className + "(\\s|$)"));
}

function addClass(el, className) {
    if (el.classList) el.classList.add(className);
    else if (!hasClass(el, className)) el.className += " " + className;
}

function removeClass(el, className) {
    if (el.classList) el.classList.remove(className);
    else if (hasClass(el, className)) {
        var reg = new RegExp("(\\s|^)" + className + "(\\s|$)");
        el.className = el.className.replace(reg, " ");
    }
}

function removeElementByIdIfExists(id) {
    var e = document.getElementById(id);
    if (e) {
        e.parentNode.removeChild(e);
    }
}

var docCookies = {
    getItem: function (sKey) {
        if (!sKey || !this.hasItem(sKey)) {
            return "__COOKIE_NOT_FOUND_TOKEN__";
        }
        return unescape(
            document.cookie.replace(
                new RegExp(
                    "(?:^|.*;\\s*)" +
                    escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") +
                    "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"
                ),
                "$1"
            )
        );
    },

    setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/.test(sKey)) {
            return;
        }
        var sExpires = "";
        if (vEnd) {
            switch (typeof vEnd) {
                case "number":
                    sExpires = "; max-age=" + vEnd;
                    break;
                case "string":
                    sExpires = "; expires=" + vEnd;
                    break;
                case "object":
                    if (vEnd.hasOwnProperty("toGMTString")) {
                        sExpires = "; expires=" + vEnd.toGMTString();
                    }
                    break;
            }
        }
        document.cookie =
            escape(sKey) +
            "=" +
            escape(sValue) +
            sExpires +
            (sDomain ? "; domain=" + sDomain : "") +
            (sPath ? "; path=" + sPath : "") +
            (bSecure ? "; secure" : "");
    },
    removeItem: function (sKey) {
        if (!sKey || !this.hasItem(sKey)) {
            return;
        }
        var oExpDate = new Date();
        oExpDate.setDate(oExpDate.getDate() - 1);
        document.cookie =
            encodeURIComponent(sKey) + "=; expires=" + oExpDate.toGMTString() + "; path=/";
    },
    hasItem: function (sKey) {
        return new RegExp(
            "(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\="
        ).test(document.cookie);
    }
};

window.addEventListener("pageshow", function (event) {
    if (window.performance.navigation.type === 2) {
        location.reload(true);
    }
});

function buildPage() {
    <!-- BUILD PAGE PAYLOAD PLACEHOLDER -->
    connectWs();
}
