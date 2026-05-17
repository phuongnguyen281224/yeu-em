import React, { useState, useEffect } from 'react';
import './index.css';
import { DATA } from './data';
import { sr, initAudio, startMusic, stopMusic, playOpenSound } from './utils';
import Petals from './Petals';

export default function App() {
  const [openedSet, setOpenedSet] = useState(new Set());
  const [current, setCurrent] = useState(0);
  const [pileList, setPileList] = useState([]);
  const [pendingClose, setPendingClose] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  
  const [boxIntShow, setBoxIntShow] = useState(false);
  const [labelGone, setLabelGone] = useState(false);
  const [flyingEnv, setFlyingEnv] = useState(null); // { i, rect, opacity, scale }
  const [modalActive, setModalActive] = useState(false);
  const [envs, setEnvs] = useState([]);

  // Setup dimensions for envelopes when box opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setLabelGone(true), 600);
      setTimeout(() => {
        playOpenSound();
        setBoxIntShow(true);
        
        // Calculate envelope positions based on box-int size
        const intEl = document.getElementById('box-int');
        if (intEl) {
          const iw = intEl.clientWidth, ih = intEl.clientHeight;
          const ew = Math.max(52, Math.min(iw * 0.148, 106));
          const eh = ew * 0.618;
          
          const newEnvs = DATA.map((_, i) => {
            const maxX = Math.max(0, iw - ew - 8);
            const maxY = Math.max(0, ih - eh - 8);
            const x = 4 + sr(i, 0) * maxX, y = 4 + sr(i, 1) * maxY;
            const r = (sr(i, 2) - 0.5) * 56;
            const z = (i % 9) + 1;
            return { i, x, y, r, z, ew, eh, visible: true, opacity: 0 };
          });
          setEnvs(newEnvs);
          
          // Staggered fade in
          newEnvs.forEach((env, idx) => {
            setTimeout(() => {
              setEnvs(prev => prev.map(e => e.i === env.i ? { ...e, opacity: 1 } : e));
            }, 55 + idx * 40);
          });
        }
      }, 850);
    }
  }, [isOpen]);

  const toggleAudio = () => {
    const nextState = !audioOn;
    setAudioOn(nextState);
    if (nextState) {
      startMusic();
    } else {
      stopMusic();
    }
  };

  const openBox = () => {
    if (isOpen) return;
    initAudio();
    setIsOpen(true);
  };

  const clickEnv = (i, envObj, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Hide mini env
    setEnvs(prev => prev.map(env => env.i === i ? { ...env, visible: false } : env));
    
    // Trigger fly envelope
    setFlyingEnv({
      rect,
      i,
      opacity: 1,
      transform: 'none',
      transition: 'none'
    });
    
    // Animate to center
    requestAnimationFrame(() => requestAnimationFrame(() => {
      setFlyingEnv({
        rect: {
          left: window.innerWidth / 2 - rect.width / 2,
          top: window.innerHeight / 2 - rect.height / 2,
          width: rect.width,
          height: rect.height
        },
        i,
        opacity: 0,
        transform: 'scale(1.5)',
        transition: 'all .44s cubic-bezier(.25,.46,.45,.94)'
      });
    }));

    // Reset fly and open modal
    setTimeout(() => {
      setFlyingEnv(null);
    }, 520);

    setTimeout(() => {
      setPendingClose(i);
      openModal(i);
    }, 420);
  };

  const openModal = (i) => {
    setCurrent(i);
    setOpenedSet(prev => {
      const next = new Set(prev);
      next.add(i);
      return next;
    });
    setModalActive(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalActive(false);
    document.body.style.overflow = '';
    setTimeout(() => {
      if (pendingClose >= 0) {
        addToPile(pendingClose);
        setPendingClose(-1);
      }
    }, 360);
  };

  const navigateModal = (dir) => {
    let ni = (current + dir + DATA.length) % DATA.length;
    for (let k = 1; k <= DATA.length; k++) {
      const idx = (current + dir * k + DATA.length) % DATA.length;
      if (!openedSet.has(idx)) { ni = idx; break; }
    }
    
    if (pendingClose >= 0) {
      addToPile(pendingClose);
    }
    
    setEnvs(prev => prev.map(env => env.i === ni ? { ...env, visible: false } : env));
    setPendingClose(ni);
    
    setOpenedSet(prev => {
      const next = new Set(prev);
      next.add(ni);
      return next;
    });
    setCurrent(ni);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!modalActive) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') navigateModal(-1);
      if (e.key === 'ArrowRight') navigateModal(1);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [modalActive, current, openedSet, pendingClose]);

  const addToPile = (i) => {
    setPileList(prev => [...prev, i]);
  };

  const rem = DATA.length - openedSet.size;
  const counterText = rem > 0 ? `${rem} lá thư chưa đọc` : 'Tất cả đã được đọc ♥';

  return (
    <>
      <Petals />
      <button id="audio-btn" onClick={toggleAudio}>{audioOn ? '♫' : '♪'}</button>

      <div id="scene">
        <div className="wall"></div>
        <div className="wall-glow"></div>

        <div id="table">
          <div className="tbl-rail"></div>
          <div className="tbl-edge"></div>
        </div>
        <div id="box-shadow"></div>

        <div id="intro-title" className={isOpen ? 'gone' : ''}>
          <p className="itag">✦ &nbsp; Một món quà từ trái tim &nbsp; ✦</p>
          <h1 className="iname">Happy Birthday, Nhung</h1>
        </div>

        <div id="box-container">
          <div id="box-wrap">
            <div id="lid-wrap" className={isOpen ? 'open' : ''}>
              <div className="lid-top"><span className="lid-star">✦</span></div>
              <div className="lid-under"></div>
              <div className="lid-roof"></div>
              <div className="lid-side-r"></div>
              <div className="lid-side-l"></div>
            </div>
            <div id="box-body">
              <span className="bc tl"></span><span className="bc tr"></span>
              <span className="bc bl"></span><span className="bc br"></span>
              <div className="box-body-line" style={{ top: '33%' }}></div>
              <div className="box-body-line" style={{ top: '66%' }}></div>
              <div id="box-label" style={{ opacity: labelGone ? 0 : 1, pointerEvents: labelGone ? 'none' : 'auto' }}>
                <div className="bl-inner">
                  <div className="bl-to">Gửi đến:</div>
                  <div className="bl-name">Ngô Thị Hồng Nhung</div>
                </div>
              </div>
              <div id="box-int" className={boxIntShow ? 'show' : ''}>
                {envs.map(env => {
                  if (!env.visible || (openedSet.has(env.i) && pendingClose !== env.i)) return null;
                  const sealSz = env.ew * 0.224;
                  const numSz = Math.max(7, env.ew * 0.1);
                  return (
                    <div 
                      key={env.i}
                      className="me" 
                      id={`me${env.i}`}
                      style={{
                        left: env.x + 'px', 
                        top: env.y + 'px', 
                        width: env.ew + 'px', 
                        height: env.eh + 'px', 
                        zIndex: env.z,
                        transform: `rotate(${env.r}deg)`,
                        opacity: env.opacity,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = `rotate(${env.r}deg) translateY(-${env.ew * 0.18}px) scale(1.2)`;
                        e.currentTarget.style.zIndex = 50;
                        e.currentTarget.style.filter = 'brightness(1.12)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = `rotate(${env.r}deg)`;
                        e.currentTarget.style.zIndex = env.z;
                        e.currentTarget.style.filter = '';
                      }}
                      onClick={(e) => clickEnv(env.i, env, e)}
                    >
                      <div className="me-inner">
                        <div className="me-flap"></div>
                        <div className="me-seal" style={{ width: sealSz + 'px', height: sealSz + 'px', fontSize: (sealSz * 0.38) + 'px' }}>P♥N</div>
                        <span className="me-num" style={{ fontSize: numSz + 'px' }}>
                          {String(env.i + 1).padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="box-side-r"></div>
            <div className="box-side-l"></div>
            <div className="box-top-rim"></div>
          </div>
          <div id="box-counter">{counterText}</div>
          <button id="open-btn" className={isOpen ? 'gone' : ''} onClick={openBox}>✉&nbsp; Mở Hộp Thư</button>
        </div>

        <div id="read-pile" style={{ display: boxIntShow ? 'block' : 'none' }}>
          <div className="pile-lbl" id="pile-lbl">Đã đọc: {pileList.length} / {DATA.length}</div>
          <div id="pile-stack">
            {pileList.map((pi, idx) => {
              const rot = (idx % 2 === 0 ? 1 : -1) * (1.5 + (idx * 2.1) % 8);
              const ox = (idx % 3 - 1) * 5;
              const oy = -Math.min(idx * 2, 50);
              return (
                <div 
                  key={idx}
                  className="pc" 
                  style={{
                    transform: `rotate(${rot}deg) translate(${ox}px,${oy}px)`,
                    zIndex: idx + 1,
                    opacity: 1
                  }}
                ></div>
              );
            })}
          </div>
        </div>
      </div>

      {flyingEnv && (
        <div 
          id="fly-env" 
          style={{
            left: flyingEnv.rect.left + 'px',
            top: flyingEnv.rect.top + 'px',
            width: flyingEnv.rect.width + 'px',
            height: flyingEnv.rect.height + 'px',
            opacity: flyingEnv.opacity,
            transform: flyingEnv.transform,
            transition: flyingEnv.transition,
            borderRadius: '2px',
            pointerEvents: 'none'
          }}
        >
          <div className="fly-inner">
            <div className="fly-flap"></div>
            <div className="fly-seal" style={{
              width: (flyingEnv.rect.width * 0.224) + 'px',
              height: (flyingEnv.rect.width * 0.224) + 'px',
              fontSize: (flyingEnv.rect.width * 0.224 * 0.38) + 'px'
            }}>P♥N</div>
          </div>
        </div>
      )}

      <div id="modal" className={modalActive ? 'active' : ''}>
        <div className="m-bg" onClick={closeModal}></div>
        <div className="m-box">
          <div className="m-inner">
            <button className="m-close" onClick={closeModal}>✕</button>
            <div className="m-frame">
              <div className="m-frame-b">
                <div className="m-frame-m">
                  <img className="m-img" src={DATA[current]?.[0]} alt="" />
                </div>
              </div>
            </div>
            <div className="m-orn">❧ &thinsp;✦&thinsp; ❧</div>
            <p className="m-lnum">Lá thư số {String(current + 1).padStart(2, '0')}</p>
            <p className="m-msg">{DATA[current]?.[1]}</p>
            <p className="m-sig">— Phương của em &nbsp;♥</p>
            <p className="m-date">Ngày 18 tháng 5 năm 2026</p>
            <div className="m-nav">
              <button className="nb" onClick={() => navigateModal(-1)}>&#8592;</button>
              <span className="nc">{current + 1} / {DATA.length}</span>
              <button className="nb" onClick={() => navigateModal(1)}>&#8594;</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
