import { useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io(window.location.origin.includes('localhost') ? 'http://localhost:3001' : window.location.origin);

export const useSocket = (onUpdate) => {
    useEffect(() => {
        socket.on('update', (data) => {
            console.log('>>> [SOCKET]: Received update:', data);
            if (onUpdate) onUpdate(data);
        });

        return () => {
            socket.off('update');
        };
    }, [onUpdate]);

    return socket;
};
