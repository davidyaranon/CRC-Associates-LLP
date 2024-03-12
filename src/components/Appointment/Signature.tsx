

import { IonButton, IonRow } from '@ionic/react';
import React, { useRef, useEffect } from 'react';
import SignaturePad from 'signature_pad';

const SignatureComponent = () => {
  const canvasRef = useRef(null);
  let signaturePad: SignaturePad | undefined;

  useEffect(() => {
    // Initialize the SignaturePad when the component mounts
    if (canvasRef.current) {
      signaturePad = new SignaturePad(canvasRef.current);
    }

    // Clean up the SignaturePad when the component unmounts
    return () => {
      if (signaturePad) {
        signaturePad.off();
      }
    };
  }, []);

  // You can add additional functions to handle save, clear, etc.

  return (
    <>
      <canvas ref={canvasRef} style={{ border: '1px solid gray', borderRadius: '10px', width: '90vw' }}></canvas>
      <IonRow>
        <IonButton fill='clear' color='danger' onClick={() => signaturePad?.clear()}>Clear</IonButton>
        <IonButton fill='clear' color='primary'>Save</IonButton>
      </IonRow>
    </>
  );
};

export default SignatureComponent;
