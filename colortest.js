// Colortest.js
/*global alert */

(function () {
    'use strict';

    window.sitescriptdata = {
        gCoords: {},
        active: false, // set to true when events updating in real time
        colourMap: [
            {
                name: 'blue',
                rgb: [0, 0, 255]
            },
            {
                name: 'cyan',
                rgb: [0, 255, 255]
            },
            {
                name: 'green',
                rgb: [0, 255, 0]
            },
            {
                name: 'yellow',
                rgb: [255, 255, 0]
            },
            {
                name: 'red',
                rgb: [255, 0, 0]
            }
        ]
    };

    function convertRGBtoHSV(r, g, b) {
        var model = 'args',
            maxRGB,
            minRGB,
            chroma,
            h,
            s,
            v;
        // Convert object array
        if (typeof (r) === 'object') {
            if (r.hasOwnProperty('r')) {
                g = r.g;
                b = r.b;
                r = r.r;
                model = 'object';
            } else if (Array.isArray(r) && g === undefined && b === undefined) {
                g = r[1];
                b = r[2];
                r = r[0];
                model = 'array';
            }
        }
        maxRGB = Math.max(r, g, b);
        minRGB = Math.min(r, g, b);
        chroma = maxRGB - minRGB;

        // Hue
        if (chroma === 0) {
            h = 0;
        } else if (maxRGB === r) {
            h = ((g - b) / chroma) % 6;
        } else if (maxRGB === g) {
            h = ((b - r) / chroma) + 2;
        } else {
            h = ((r - g) / chroma) + 4;
        }
        h *= 60; // degrees
        if (h < 0) {
            h += 360;
        }

        // Saturation
        if (maxRGB !== 0) {
            s = chroma / maxRGB;
        } else {
            s = 0;
        }

        // Value
        v = maxRGB;

        return [h, s, v];
    }

    function convertHSVtoRGB(h, s, v) {
        var model = 'args',
            chroma,
            inter,
            match,
            rgb = {
                r: 0,
                g: 0,
                b: 0
            },
            result = [];
        // Convert object OR array
        if (typeof (h) === 'object') {
            if (h.hasOwnProperty('h')) {
                s = h.s;
                v = h.v;
                h = h.h;
                model = 'object';
            } else if (Array.isArray(h) && s === undefined && v === undefined) {
                s = h[1];
                v = h[2];
                h = h[0];
                model = 'array';
            }
        }
        chroma = v * s;
        h = h / 60; // Convert to 6 point scale

        // Calculate intermediate value
        inter = chroma * (1 - Math.abs(h % 2 - 1));

        // Assign max (chroma) and intermediate
        switch (Math.floor(h)) {
        case 0:
            rgb.r = chroma;
            rgb.g = inter;
            break;
        case 1:
            rgb.r = inter;
            rgb.g = chroma;
            break;
        case 2:
            rgb.g = chroma;
            rgb.b = inter;
            break;
        case 3:
            rgb.g = inter;
            rgb.b = chroma;
            break;
        case 4:
            rgb.r = inter;
            rgb.b = chroma;
            break;
        case 5:
            rgb.r = chroma;
            rgb.b = inter;
            break;
        default:
        }
        // Add match value
        match = v - chroma;
        ['r', 'g', 'b'].forEach(function (field) {
            var value = Math.round(rgb[field] + match);
            if (model === 'object') {
                result[field] = value;
            } else {
                result.push(value);
            }
        });

        return result;

    }

    function selectColour(evt) {
        var ws = window.sitescriptdata,
            eColour,
            eDispFull,
            eDispSeg,
            eColourArea,
            eHSV,
            eRGB,
            d,
            dRel,
            c,
            hsvMin,
            hsvMax,
            hsv = {
                h: null,
                s: null,
                v: null
            },
            rgb = {
                r: null,
                g: null,
                b: null
            },
            colourString = '';
        if (!ws.active) {
            return;
        }
        eColour = document.getElementById('colour');
        eDispFull = document.getElementById('disp_full');
        eDispSeg = document.getElementById('disp_seg');
        eColourArea = document.getElementById('colour_area');
        eHSV = {
            h: document.getElementById('hue'),
            s: document.getElementById('sat'),
            v: document.getElementById('val')
        };
        eRGB = {
            r: document.getElementById('red'),
            g: document.getElementById('green'),
            b: document.getElementById('blue')
        };

        // Displacement
        d = 100 * (evt.clientX - ws.gCoords.left) / ws.gCoords.width;
        eDispFull.innerHTML = Math.round(d).toString() + '%';
        dRel = d % 20;
        eDispSeg.innerHTML = Math.round(dRel).toString() + '%';

        // Colour Area
        c = Math.round(d / 20);
        eColourArea.innerHTML = ws.colourMap[c].name;

        // HSV / RGB from offset
        if (d === 100) { // Extreme right
            rgb = ws.colourMap[-1].rgb;
            hsvMin = convertRGBtoHSV(rgb);
            ['h', 's', 'v'].forEach(function (field, i) {
                hsv[field] = hsvMin[i];
            });
        } else {
            hsvMin = convertRGBtoHSV(ws.colourMap[Math.floor(d / 20)].rgb);
            hsvMax = convertRGBtoHSV(ws.colourMap[Math.floor(d / 20) + 1].rgb);

            ['h', 's', 'v'].forEach(function (field, i) {
                var a, b;
                if (hsvMin[i] === hsvMax[i]) {
                    hsv[field] = hsvMin[i];
                } else {
                    a = Math.min(hsvMin[i], hsvMax[i]);
                    b = Math.max(hsvMin[i], hsvMax[i]);
                    hsv[field] = (b - a) * dRel / 100 + a;
                }
            });

            rgb = convertHSVtoRGB(hsv);
        }

        // Output HSV
        ['h', 's', 'v'].forEach(function (field) {
            eHSV[field].innerHTML = hsv[field];
        });

        // Output RGB
        ['r', 'g', 'b'].forEach(function (field) {
            eRGB[field].innerHTML = rgb[field];
            colourString += rgb[field].toString() + ',';
        });
        colourString = colourString.slice(0, colourString.length - 1);

        // Colour square
        eColour.style.backgroundColor = 'rgb(' + colourString + ')';

    }

    function updateValues(evt) {
        var ws = window.sitescriptdata,
            eAbs,
            eRel;
        if (!ws.active) {
            return;
        }
        eAbs = {
            x: document.getElementById('mouse_abs_x'),
            y: document.getElementById('mouse_abs_y')
        };
        eRel = {
            x: document.getElementById('mouse_rel_x'),
            y: document.getElementById('mouse_rel_y')
        };
        eAbs.x.innerHTML = evt.clientX;
        eAbs.y.innerHTML = evt.clientY;
        eRel.x.innerHTML = evt.clientX - ws.gCoords.left;
        eRel.y.innerHTML = evt.clientY - ws.gCoords.top;

    }

    function startTracking(evt) {
        window.sitescriptdata.active = true;
        updateValues(evt);
    }

    function stopTracking() {
        window.sitescriptdata.active = false;
    }

    window.onload = function () {
        var g = document.getElementById('gradient'),
            gCoords = window.sitescriptdata.gCoords,
            gRect,
            rgb,
            hsv;

        // Set up coordinates;
        gRect = g.getBoundingClientRect();

        ['top', 'left', 'width', 'height'].map(function (field) {
            gCoords[field] = gRect[field];
        });

        // Set up event listeners
        g.addEventListener('click', selectColour);
        g.addEventListener('mouseover', startTracking);
        g.addEventListener('mousemove', updateValues);
        g.addEventListener('mouseout', stopTracking);

        // Test HSV
        rgb = [255, 0, 255];
        hsv = convertRGBtoHSV(rgb);

    };


}());
