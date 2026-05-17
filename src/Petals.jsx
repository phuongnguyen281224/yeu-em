import React, { useEffect, useRef } from 'react';

export default function Petals() {
  const cvsRef = useRef(null);

  useEffect(() => {
    const cvs = cvsRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    let ptls = [];
    const isMob = () => window.innerWidth <= 560;

    function rsz() {
      cvs.width = window.innerWidth;
      cvs.height = window.innerHeight;
    }
    rsz();
    window.addEventListener('resize', rsz);

    function mkP() {
      return {
        x: Math.random() * window.innerWidth,
        y: -15,
        sz: 5 + Math.random() * 9,
        vy: 0.5 + Math.random() * 1.4,
        vx: (Math.random() - 0.5) * 1.3,
        rot: Math.random() * Math.PI * 2,
        dr: (Math.random() - 0.5) * 0.055,
        op: 0.3 + Math.random() * 0.44,
        col: Math.random() > 0.45 ? '#F0AAAA' : '#F4CCAA',
        wb: Math.random() * Math.PI * 2,
        wbs: 0.02 + Math.random() * 0.03
      };
    }

    let frameId;
    function animP() {
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      const maxP = isMob() ? 30 : 70;
      if (Math.random() < (isMob() ? 0.07 : 0.13) && ptls.length < maxP) ptls.push(mkP());
      ptls = ptls.filter(p => p.y < cvs.height + 20);
      ptls.forEach(p => {
        p.y += p.vy;
        p.wb += p.wbs;
        p.x += p.vx + Math.sin(p.wb) * 0.7;
        p.rot += p.dr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.op;
        ctx.fillStyle = p.col;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.sz * 0.44, p.sz, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      frameId = requestAnimationFrame(animP);
    }
    animP();

    return () => {
      window.removeEventListener('resize', rsz);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <canvas id="petals" ref={cvsRef}></canvas>;
}
