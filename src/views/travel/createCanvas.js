import { AlwaysDepth } from "three";

// 创建canvas
export class JKCanvasTextureEditor {
    constructor(width = 512, height = 512, bgColor = 'rgb(255,255,255)') {
        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.backgroundColor = bgColor;
    }

    draw (fn) {
        const ctx = this.canvas.getContext("2d");
        if (ctx) {
            fn(ctx)
        } else {
            console.warn('你的浏览器不支持canvas')
        }
        return this
    }

    preview () {
        const canvas = this.canvas;
        canvas.style.position = "fixed";
        canvas.style.top = "25%";
        canvas.style.left = "25%";
        document.body.appendChild(canvas);
        return this
    }
}

