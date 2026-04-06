import * as yup from 'yup';
import type { SubmitHandler } from 'react-hook-form';
import type { RegisterUserInput } from '@/types';
import { useMutation } from 'react-query';
import toast from 'react-hot-toast';
import { Form } from '@/components/ui/forms/form';
import Password from '@/components/ui/forms/password';
import { useModalAction } from '@/components/modal-views/context';
import Input from '@/components/ui/forms/input';
import client from '@/data/client';
import Button from '@/components/ui/button';
import { RegisterBgPattern } from '@/components/auth/register-bg-pattern';
import { useState, useRef } from 'react';
import useAuth from './use-auth';
import { useUserContext } from '../preppers/context';
import { ServerErrors } from '@/components/ui/forms/form';
import * as fbq from '../../lib/fpixel';
import { analytics, logEvent } from '@/lib/firebase';

// Email-only sign-up. The OTP is delivered via Nodemailer (see
// src/pages/api/auth/send-otp.ts) so there is no SMS provider required and
// no phone number is collected at all.
const registerUserValidationSchema = yup.object().shape({
  name: yup.string().max(40).required(),
  email: yup.string().email().required(),
  password: yup.string().required().min(6),
  otp: yup
    .string()
    .matches(/^\d{4,6}$/, 'Code should be 4–6 digits')
    .required(),
});

type FormValues = {
  name: string;
  email: string;
  password: string;
  otp: string;
};

export default function RegisterUserForm() {
  const { openModal, closeModal } = useModalAction();
  const { authorize } = useAuth();
  const { setUserInfo } = useUserContext();
  const [codeSent, setCodeSent] = useState(false);
  const [time, setTime] = useState(0);
  const timerRef = useRef<any>();
  const timeTempRef = useRef<number>(0);
  // Email used to request the OTP — kept in a ref so the "Send code" button
  // doesn't have to live inside the react-hook-form context.
  const pendingEmailRef = useRef<string>('');

  let [serverError, setServerError] = useState<RegisterUserInput | null>(null);
  const { mutate, isLoading } = useMutation(client.users.register, {
    onSuccess: (res) => {
      if (!res.payload.consumer_id) {
        toast.error(<b>Something went wrong</b>, {
          className: '-mt-10 xs:mt-0',
        });
        return;
      }
      toast.success(<b>Successfully Signed up.</b>, {
        className: '-mt-10 xs:mt-0',
      });

      fbq.event('CompleteRegistration', {
        content_name: 'consumer_id',
        value: res.payload.consumer_id,
      });
      logEvent(analytics, 'sign_up', {
        content_name: 'consumer_id',
        value: res.payload.consumer_id,
      });

      authorize(res.payload.consumer_id);
      setUserInfo(res.payload);
      closeModal();
    },
    onError: (err: any) => {
      toast.error(<b>Something went wrong</b>, {
        className: '-mt-10 xs:mt-0',
      });
      setServerError(err.response?.data);
    },
  });

  const { mutate: optMutate, isLoading: optLoading } = useMutation(
    client.users.getOpt,
    {
      onSuccess: (res) => {
        if (!res.payload.otp) {
          toast.error(<b>Something went wrong</b>, {
            className: '-mt-10 xs:mt-0',
          });
          return;
        }
        toast.success(<b>Code sent to your email</b>, {
          className: '-mt-10 xs:mt-0',
        });
        clearTimeout(timerRef.current);
        setCodeSent(true);
        setTime(0);
        timeTempRef.current = 0;
        timerRef.current = setInterval(() => {
          timeTempRef.current++;
          setTime(timeTempRef.current);
          if (timeTempRef.current === 60) {
            clearTimeout(timerRef.current);
            setCodeSent(false);
          }
        }, 1000);
      },
      onError: () => {
        toast.error(<b>Could not send code — check your email</b>, {
          className: '-mt-10 xs:mt-0',
        });
      },
    }
  );

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    clearTimeout(timerRef.current);
    mutate({
      ...(data as any),
      register_type: 'email',
      code: 'EN',
      device_id: 'web',
      device_token: 'web',
      device_type: 'web',
      device_name: 'web',
      user_type: 'consumer',
    });
  };

  const codeClick = () => {
    const email = pendingEmailRef.current.trim();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error(<b>Enter your email first</b>, {
        className: '-mt-10 xs:mt-0',
      });
      return;
    }
    optMutate({
      type: 'consumer',
      email,
      request_type: 'signUp',
      code: 'EN',
    });
  };

  return (
    <div className="px-6 pt-10 pb-8 sm:px-8 lg:p-12">
      <RegisterBgPattern className="absolute bottom-0 left-0 text-light dark:text-dark-300 dark:opacity-60" />
      <div className="relative z-10 flex items-center">
        <div className="w-full shrink-0 text-left md:w-[380px]">
          <div className="flex flex-col pb-5 text-center lg:pb-9 xl:pb-10 xl:pt-2">
            <h2 className="text-lg font-medium tracking-[-0.3px] text-dark dark:text-light lg:text-xl">
              Create your account
            </h2>
            <div className="mt-1.5 text-13px leading-6 tracking-[0.2px] dark:text-light-900 lg:mt-2.5 xl:mt-3">
              Already have an account?{' '}
              <button
                onClick={() => openModal('LOGIN_VIEW')}
                className="inline-flex font-semibold text-brand hover:text-dark-400 hover:dark:text-light-500"
              >
                Login here
              </button>
            </div>
          </div>

          <Form<FormValues>
            onSubmit={onSubmit}
            validationSchema={registerUserValidationSchema}
            serverError={
              serverError as
                | ServerErrors<Partial<RegisterUserInput>>
                | null
                | undefined
            }
            className="space-y-4 lg:space-y-5"
          >
            {({ register, formState: { errors }, watch }) => {
              // Keep the latest email value in a ref so the Send-code button
              // (outside the submit handler) can read it without re-rendering
              // the entire form on every keystroke.
              pendingEmailRef.current = watch('email') || '';
              return (
                <>
                  <Input
                    label="Name"
                    inputClassName="bg-light dark:bg-dark-300"
                    {...register('name')}
                    error={errors.name?.message}
                  />
                  <Input
                    label="Email"
                    inputClassName="bg-light dark:bg-dark-300"
                    type="email"
                    {...register('email')}
                    error={errors.email?.message}
                  />
                  <div>
                    <p
                      onClick={codeClick}
                      className="float-right -mt-1 cursor-pointer text-sm font-semibold text-brand hover:text-brand-dark"
                    >
                      {!codeSent ? 'Send code' : 'Re-send code'}
                    </p>
                    <div className="clear-both" />
                  </div>
                  <Input
                    label="Verification code"
                    inputClassName="bg-light dark:bg-dark-300"
                    inputMode="numeric"
                    {...register('otp')}
                    error={errors.otp?.message}
                    disabled={optLoading || !codeSent}
                  />
                  {codeSent && (
                    <p className="float-right -translate-y-4 text-warning">{`00 : ${
                      60 - time >= 10 ? 60 - time : '0' + (60 - time)
                    }`}</p>
                  )}
                  <Password
                    label="Password"
                    inputClassName="bg-light dark:bg-dark-300"
                    {...register('password')}
                    error={errors.password?.message}
                  />
                  <Button
                    type="submit"
                    className="!mt-5 w-full text-sm tracking-[0.2px] lg:!mt-7"
                    disabled={isLoading}
                  >
                    Register
                  </Button>
                </>
              );
            }}
          </Form>
        </div>
      </div>
    </div>
  );
}
