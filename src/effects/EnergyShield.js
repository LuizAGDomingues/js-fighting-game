/**
 * EnergyShield uses two static assets:
 * - normal.png while block is held
 * - attacked.png for the brief blocked-hit response
 */

export class EnergyShield {
    static _normalImage = null;
    static _hitImage = null;

    static setImages(normalImage, hitImage) {
        EnergyShield._normalImage = normalImage?.complete ? normalImage : null;
        EnergyShield._hitImage = hitImage?.complete ? hitImage : null;
    }

    static draw(ctx, fighter) {
        const { position, width, height, shieldHitTimer, characterConfig, facingRight } = fighter;
        const isHit = shieldHitTimer > 0;
        const sb = characterConfig?.shieldBox;
        const shieldBox = {
            x: sb?.x ?? -18,
            y: sb?.y ?? -12,
            width: sb?.width ?? (width + 40),
            height: sb?.height ?? (height + 24)
        };

        const sx = facingRight
            ? Math.round(position.x + shieldBox.x)
            : Math.round(position.x + width - shieldBox.x - shieldBox.width);
        const sy = Math.round(position.y + shieldBox.y);
        const sw = Math.round(shieldBox.width);
        const sh = Math.round(shieldBox.height);
        const img = isHit && EnergyShield._hitImage?.complete
            ? EnergyShield._hitImage
            : EnergyShield._normalImage;

        if (img?.complete) {
            EnergyShield._drawImageCover(ctx, img, sx, sy, sw, sh);
            return;
        }

        EnergyShield._drawProgrammatic(ctx, sx, sy, sw, sh, isHit, shieldHitTimer);
    }

    static _drawImageCover(ctx, img, sx, sy, sw, sh) {
        const scale = Math.max(sw / img.width, sh / img.height);
        const drawW = img.width * scale;
        const drawH = img.height * scale;
        const drawX = sx + (sw - drawW) / 2;
        const drawY = sy + (sh - drawH) / 2;

        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        ctx.restore();
    }

    static _drawProgrammatic(ctx, sx, sy, sw, sh, isHit, shieldHitTimer) {
        const hitRatio = isHit ? Math.min(1, shieldHitTimer / 0.25) : 0;
        const t = Date.now() / 1000;
        const blink = Math.round(Math.sin(t * 8) * 0.5 + 0.5);

        const fillAlpha = isHit ? 0.25 + hitRatio * 0.30 : 0.18 + blink * 0.06;
        const fillColor = isHit
            ? `rgba(255, 50, 0, ${fillAlpha})`
            : `rgba(40, 90, 255, ${fillAlpha})`;

        const c1 = isHit ? '#ff2200' : (blink ? '#4466ff' : '#6699ff');
        const c2 = isHit ? '#ff8800' : '#88bbff';
        const c3 = isHit ? '#ffcc00' : '#aaccff';
        const glow = isHit ? '#ff3300' : '#3366ff';
        const pixel = 5;

        ctx.save();
        ctx.imageSmoothingEnabled = false;

        ctx.shadowColor = glow;
        ctx.shadowBlur = isHit ? 32 + hitRatio * 20 : 20;
        ctx.fillStyle = fillColor;
        ctx.fillRect(sx, sy, sw, sh);
        ctx.shadowBlur = 0;

        const scanA = isHit ? 0.35 + hitRatio * 0.20 : 0.22;
        ctx.fillStyle = isHit
            ? `rgba(255, 120, 0, ${scanA})`
            : `rgba(160, 200, 255, ${scanA})`;
        for (let y = sy + pixel; y < sy + sh - pixel; y += pixel * 2) {
            ctx.fillRect(sx + pixel, y, sw - pixel * 2, pixel);
        }

        const border = pixel * 2;
        ctx.shadowColor = glow;
        ctx.shadowBlur = isHit ? 14 : 8;

        EnergyShield._pixelRow(ctx, sx, sy, sw, border, c1, c2, c3, pixel);
        EnergyShield._pixelRow(ctx, sx, sy + sh - border, sw, border, c1, c2, c3, pixel);
        EnergyShield._pixelCol(ctx, sx, sy + border, sh - border * 2, border, c1, c2, c3, pixel);
        EnergyShield._pixelCol(ctx, sx + sw - border, sy + border, sh - border * 2, border, c1, c2, c3, pixel);

        ctx.shadowBlur = isHit ? 20 : 12;
        ctx.fillStyle = isHit ? '#ffffff' : c3;
        ctx.fillRect(sx, sy, border, border);
        ctx.fillRect(sx + sw - border, sy, border, border);
        ctx.fillRect(sx, sy + sh - border, border, border);
        ctx.fillRect(sx + sw - border, sy + sh - border, border, border);

        if (isHit && hitRatio > 0.5) {
            const a = (hitRatio - 0.5) * 2;
            ctx.fillStyle = `rgba(255, 240, 120, ${a * 0.55})`;
            ctx.shadowBlur = 0;
            ctx.fillRect(sx, sy, sw, border);
            ctx.fillRect(sx, sy + sh - border, sw, border);
            ctx.fillRect(sx, sy, border, sh);
            ctx.fillRect(sx + sw - border, sy, border, sh);
        }

        ctx.restore();
    }

    static _pixelRow(ctx, x, y, w, h, c1, c2, c3, pixel) {
        const chunk = pixel * 3;
        for (let px = x; px < x + w; px += chunk) {
            const i = Math.floor((px - x) / chunk) % 3;
            ctx.fillStyle = [c1, c2, c3][i];
            ctx.fillRect(px, y, Math.min(chunk, x + w - px), h);
        }
    }

    static _pixelCol(ctx, x, y, h, w, c1, c2, c3, pixel) {
        const chunk = pixel * 3;
        for (let py = y; py < y + h; py += chunk) {
            const i = Math.floor((py - y) / chunk) % 3;
            ctx.fillStyle = [c1, c2, c3][i];
            ctx.fillRect(x, py, w, Math.min(chunk, y + h - py));
        }
    }
}
