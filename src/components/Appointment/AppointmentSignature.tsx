

import { IonButton, IonGrid, IonRow, useIonLoading, useIonToast } from '@ionic/react';
import React, { useRef, useEffect, useState } from 'react';
import SignaturePad from 'signature_pad';
import useAppContext from '../../hooks/useContext';
import FirebaseAuth, { uploadSignature } from '../../utils/server';
import { useAuthState } from 'react-firebase-hooks/auth';

type AppointmentSignatureProps = {
  width?: string;
  height?: string;
  modalVisible: boolean;
  appointmentId: string;
  signatureUrl: string;
  setSignatureUrl: React.Dispatch<React.SetStateAction<string>>;
}

const AppointmentSignature = (props: AppointmentSignatureProps) => {

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const context = useAppContext();
  const [auth] = useAuthState(FirebaseAuth);
  const [presentToast] = useIonToast();
  const [presentLoading, dismissLoading] = useIonLoading();
  let signaturePad: SignaturePad | undefined;

  const getCanvasBlob = async (canvas: HTMLCanvasElement): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas to Blob conversion failed'));
        }
      });
    });
  };

  const saveSignature = async () => {
    if (!signaturePad || !canvasRef || !canvasRef.current || !auth || !props.appointmentId) {
      presentToast({ message: "Something went wrong", duration: 3000, color: 'danger' });
      return;
    }
    await presentLoading({ message: 'Saving...' });
    try {
      const blob = await getCanvasBlob(canvasRef.current);
      await uploadSignature(blob, auth.uid, props.appointmentId);
    } catch (err) {
      presentToast({ message: 'Failed conversion', duration: 3000, color: 'danger' });
    } finally {
      props.setSignatureUrl(signaturePad.toDataURL());
      await dismissLoading();
      await presentToast({ message: 'Success', duration: 3000, color: 'primary' });
    }
  };

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
      if (props.signatureUrl) {
        let image = new Image();
        image.onload = () => {
          signaturePad?.fromDataURL(props.signatureUrl);
        };
        image.src = props.signatureUrl;
      }
    }
    return () => {
      if (signaturePad) {
        signaturePad.off();
      }
    };
  }, [props.modalVisible, props.signatureUrl]);


  return (
    <>
      <IonGrid>
        <IonRow>
          <canvas ref={canvasRef} style={{ border: '1px solid gray', width: props.width || '50vw', height: props.height || '50vh' }}></canvas>
        </IonRow>
        <IonRow style={{ justifyContent: 'flex-end' }}>
          <IonButton fill='clear' color='danger' onClick={() => { signaturePad?.clear(); /*props.setSignatureDataUrl(null);*/ }}>Clear</IonButton>
          <IonButton fill='clear' color='primary' onClick={saveSignature}>Save</IonButton>
        </IonRow>
      </IonGrid>
    </>
  );
};

export default AppointmentSignature;
