import React, { useState, useEffect, useRef } from 'react';

interface Props {
  guestName: string;
  sponsorRole?: 'ninong' | 'ninang' | null;
  children: React.ReactNode;
}

const InvitationEnvelope: React.FC<Props> = ({ guestName, sponsorRole, children }) => {
  const sponsorTitle = sponsorRole === 'ninong' ? 'Ninong' : sponsorRole === 'ninang' ? 'Ninang' : null;
  const [phase, setPhase] = useState<'sealed' | 'opening' | 'opened' | 'closing'>('sealed');
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const open = () => {
    if (phaseRef.current !== 'sealed') return;
    setPhase('opening');
    setTimeout(() => setPhase('opened'), 900);
  };

  const close = () => {
    if (phaseRef.current !== 'opened') return;
    setPhase('closing');
    setTimeout(() => {
      setPhase('sealed');
      window.scrollTo({ top: 0 });
    }, 500);
  };

  // Scroll down to open (when sealed), scroll up to close (when at top of page)
  useEffect(() => {
    let touchStartY = 0;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 0 && phaseRef.current === 'sealed') open();
      if (e.deltaY < 0 && phaseRef.current === 'opened' && window.scrollY === 0) close();
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      const delta = touchStartY - e.touches[0].clientY;
      if (delta > 10  && phaseRef.current === 'sealed') open();
      if (delta < -10 && phaseRef.current === 'opened' && window.scrollY === 0) close();
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  const showEnvelope = phase === 'sealed' || phase === 'opening';
  const showContent  = phase === 'opened'  || phase === 'closing';

  return (
    <>
      {showEnvelope && (
        <div className={`env-screen ${phase === 'opening' ? 'env-screen-exit' : ''}`}>
          <div className="env-outer">
            <div className={`env-card ${phase === 'opening' ? 'env-card-opening' : ''}`}>
              <div className={`env-flap ${phase === 'opening' ? 'env-flap-open' : ''}`} />
              <div className="env-fold-left" />
              <div className="env-fold-right" />
              <div className="env-body">
                <div className="env-seal">
                  <span className="env-seal-letter">D</span>
                </div>
                <p className="env-tagline">You Are Cordially Invited</p>
                <p className="env-ceremony">Holy Baptism</p>
                <p className="env-of-label">of</p>
                <h1 className="env-baby-name">Danya Penelope</h1>
                <div className="env-ornament-divider">
                  <span />
                  <span className="env-star">✦</span>
                  <span />
                </div>
                <p className="env-date-line">Saturday · May 16, 2026</p>
                {guestName && (
                  <p className="env-guest-name">
                    Dear{sponsorTitle ? ` ${sponsorTitle}` : ''} {guestName}
                  </p>
                )}
              </div>
            </div>
            <div className="env-scroll-hint">
              <span className="env-scroll-label">Scroll to open</span>
              <span className="env-scroll-arrow">↓</span>
            </div>
          </div>
        </div>
      )}

      {showContent && (
        <div className={phase === 'closing' ? 'invitation-exit' : 'invitation-reveal'}>
          {children}
        </div>
      )}
    </>
  );
};

export default InvitationEnvelope;
