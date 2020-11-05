import React, { FC, useState } from "react";

import { ResetPasswordStep1 } from "./Step1";
import { ResetPasswordStep2 } from "./Step2";
import { ResetPasswordStep3 } from "./Step3";
import { ResetPasswordStep4 } from "./Step4";

export const ResetPasswordForm: FC = () => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const onStep1Finish = async (type: string, value: string) => {
    if (type === "phone") {
      setPhone(value);
      setStep(2);
    } else if (type === "email") {
      setEmail(value);
      setStep(3);
    }
  };

  const onStep2OrStep3Finish = () => {
    setStep(4);
  };

  switch (step) {
    case 1:
      return <ResetPasswordStep1 onSuccess={onStep1Finish}></ResetPasswordStep1>;
    case 2:
      return <ResetPasswordStep2 phone={phone} onSuccess={onStep2OrStep3Finish}></ResetPasswordStep2>;
    case 3:
      return <ResetPasswordStep3 email={email} onSuccess={onStep2OrStep3Finish}></ResetPasswordStep3>;
    case 4:
      return <ResetPasswordStep4></ResetPasswordStep4>;
    default:
      return null;
  }
};
