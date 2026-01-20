import React, { useEffect, useState } from 'react';

const GoalParticles = ({ active }) => {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        if (active) {
            const newParticles = Array.from({ length: 40 }).map((_, i) => ({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 4 + 1,
                color: Math.random() > 0.5 ? '#FF6B35' : '#7000ff',
                delay: Math.random() * 2,
                duration: 2 + Math.random() * 2,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10
            }));
            setParticles(newParticles);

            const timer = setTimeout(() => {
                setParticles([]);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [active]);

    if (!active || particles.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[2000] overflow-hidden">
            {particles.map(p => (
                <div
                    key={p.id}
                    className="absolute rounded-full animate-pulse capitalize"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        backgroundColor: p.color,
                        boxShadow: `0 0 10px ${p.color}`,
                        animation: `particle-float ${p.duration}s linear forwards`,
                        '--vx': `${p.vx}vw`,
                        '--vy': `${p.vy}vh`
                    }}
                />
            ))}
            <style jsx>{`
                @keyframes particle-float {
                    0% {
                        transform: translate(0, 0) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(var(--vx), var(--vy)) scale(0);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default GoalParticles;
