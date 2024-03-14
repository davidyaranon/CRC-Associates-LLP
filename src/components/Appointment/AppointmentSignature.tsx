

import { IonButton, IonGrid, IonRow } from '@ionic/react';
import React, { useRef, useEffect } from 'react';
import SignaturePad from 'signature_pad';
import useAppContext from '../../hooks/useContext';

type AppointmentSignatureProps = {
  width?: string;
  height?: string;
  modalVisible: boolean;
}

const AppointmentSignature = (props: AppointmentSignatureProps) => {

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const context = useAppContext();
  let signaturePad: SignaturePad | undefined;

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      const ctx = canvas.getContext('2d');
      ctx && ctx.scale(ratio, ratio);
      signaturePad?.clear();
    }
  };

  useEffect(() => {
    if (props.modalVisible && canvasRef.current) {
      signaturePad = new SignaturePad(canvasRef.current);
      signaturePad.penColor = context.darkMode ? 'white' : 'black';
      resizeCanvas();
    }
    return () => {
      if (signaturePad) {
        signaturePad.off();
      }
    };
  }, [props.modalVisible]);


  return (
    <>
      <IonGrid>
        <IonRow>
          <canvas ref={canvasRef} style={{ border: '1px solid gray', width: props.width || '50vw', height: props.height || '50vh' }}></canvas>
        </IonRow>
        <IonRow style={{ justifyContent: 'flex-end' }}>
          <IonButton  fill='clear' color='danger' onClick={() => signaturePad?.clear()}>Clear</IonButton>
          <IonButton fill='clear' color='primary'>Save</IonButton>
        </IonRow>
      </IonGrid>
    </>
  );
};

export default AppointmentSignature;
