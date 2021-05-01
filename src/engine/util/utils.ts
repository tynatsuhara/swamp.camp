import { Point } from "../point"

export function rectContains(rectPosition: Point, rectDimensions: Point, pt: Point): boolean {
    return pt.x >= rectPosition.x && pt.x < rectPosition.x + rectDimensions.x
                && pt.y >= rectPosition.y && pt.y < rectPosition.y + rectDimensions.y
}

export function clamp(val: number, min: number, max: number) {
    return Math.min(Math.max(val, min), max)
}

// from https://stackoverflow.com/questions/4391575/how-to-find-the-size-of-localstorage
window["localStorageUsage"] = () => {
    var _lsTotal = 0, _xLen, _x;
    for (_x in localStorage) {
        if (!localStorage.hasOwnProperty(_x)) {
            continue;
        }
        _xLen = ((localStorage[_x].length + _x.length) * 2);
        _lsTotal += _xLen;
        console.log(_x.substr(0, 50) + " = " + (_xLen / 1024).toFixed(2) + " KB")
    };
    console.log("Total = " + (_lsTotal / 1024).toFixed(2) + " KB");
}