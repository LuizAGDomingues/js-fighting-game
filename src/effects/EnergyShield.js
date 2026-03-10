/**
 * EnergyShield — Pixel-art style energy shield.
 * Idle: blue pixel border with scanlines + glow.
 * Hit: flashes red/orange with bright pixel burst.
 */

const PIXEL = 5; // "pixel art pixel" block size

export class EnergyShield {
    static draw(ctx, fighter) {
        const { position, width, height, shieldHitTimer, characterConfig } = fighter;
        const isHit = shieldHitTimer > 0;
        const hitRatio = isHit ? Math.min(1, shieldHitTimer / 0.25) : 0;

        // Shield bounds — use per-character shieldBox or fallback to collision box
        const sb = characterConfig?.shieldBox;
        const sx = Math.round(position.x + (sb?.x ?? -8));
        const sy = Math.round(position.y + (sb?.y ?? -4));
        const sw = Math.round(sb?.width ?? (width + 16));
        const sh = Math.round(sb?.height ?? (height + 8));

        const t = Date.now() / 1000;
        const blink = Math.round(Math.sin(t * 8) * 0.5 + 0.5); // 0 or 1 fast flicker

        // Color palette
        const fillAlpha = isHit ? 0.25 + hitRatio * 0.30 : 0.18 + blink * 0.06;
        const fillColor = isHit
            ? `rgba(255, 50, 0, ${fillAlpha})`
            : `rgba(40, 90, 255, ${fillAlpha})`;

        const c1 = isHit ? '#ff2200' : (blink ? '#4466ff' : '#6699ff');
        const c2 = isHit ? '#ff8800' : '#88bbff';
        const c3 = isHit ? '#ffcc00' : '#aaccff';
        const glow = isHit ? '#ff3300' : '#3366ff';

        ctx.save();
        ctx.imageSmoothingEnabled = false;

        // ── Outer glow ──────────────────────────────────────────────
        ctx.shadowColor = glow;
        ctx.shadowBlur = isHit ? 32 + hitRatio * 20 : 20;

        // ── Interior fill ───────────────────────────────────────────
        ctx.fillStyle = fillColor;
        ctx.fillRect(sx, sy, sw, sh);
        ctx.shadowBlur = 0;

        // ── Horizontal scanlines ─────────────────────────────────────
        const scanA = isHit ? 0.35 + hitRatio * 0.20 : 0.22;
        ctx.fillStyle = isHit
            ? `rgba(255, 120, 0, ${scanA})`
            : `rgba(160, 200, 255, ${scanA})`;
        for (let y = sy + PIXEL; y < sy + sh - PIXEL; y += PIXEL * 2) {
            ctx.fillRect(sx + PIXEL, y, sw - PIXEL * 2, PIXEL);
        }

        // ── Chunky pixel border ──────────────────────────────────────
        const bp = PIXEL * 2; // border thickness
        ctx.shadowColor = glow;
        ctx.shadowBlur = isHit ? 14 : 8;

        // Top
        EnergyShield._pixelRow(ctx, sx, sy, sw, bp, c1, c2, c3);
        // Bottom
        EnergyShield._pixelRow(ctx, sx, sy + sh - bp, sw, bp, c1, c2, c3);
        // Left
        EnergyShield._pixelCol(ctx, sx, sy + bp, sh - bp * 2, bp, c1, c2, c3);
        // Right
        EnergyShield._pixelCol(ctx, sx + sw - bp, sy + bp, sh - bp * 2, bp, c1, c2, c3);

        // ── Corner accent squares ────────────────────────────────────
        ctx.shadowBlur = isHit ? 20 : 12;
        ctx.fillStyle = isHit ? '#ffffff' : c3;
        ctx.fillRect(sx, sy, bp, bp);
        ctx.fillRect(sx + sw - bp, sy, bp, bp);
        ctx.fillRect(sx, sy + sh - bp, bp, bp);
        ctx.fillRect(sx + sw - bp, sy + sh - bp, bp, bp);

        // ── Hit flash burst ──────────────────────────────────────────
        if (isHit && hitRatio > 0.5) {
            const a = (hitRatio - 0.5) * 2;
            ctx.fillStyle = `rgba(255, 240, 120, ${a * 0.55})`;
            ctx.shadowBlur = 0;
            ctx.fillRect(sx, sy, sw, bp);
            ctx.fillRect(sx, sy + sh - bp, sw, bp);
            ctx.fillRect(sx, sy, bp, sh);
            ctx.fillRect(sx + sw - bp, sy, bp, sh);
        }

        ctx.restore();
    }

    static _pixelRow(ctx, x, y, w, h, c1, c2, c3) {
        const chunk = PIXEL * 3;
        for (let px = x; px < x + w; px += chunk) {
            const i = Math.floor((px - x) / chunk) % 3;
            ctx.fillStyle = [c1, c2, c3][i];
            ctx.fillRect(px, y, Math.min(chunk, x + w - px), h);
        }
    }

    static _pixelCol(ctx, x, y, h, w, c1, c2, c3) {
        const chunk = PIXEL * 3;
        for (let py = y; py < y + h; py += chunk) {
            const i = Math.floor((py - y) / chunk) % 3;
            ctx.fillStyle = [c1, c2, c3][i];
            ctx.fillRect(x, py, w, Math.min(chunk, y + h - py));
        }
    }
}
