import { useState } from 'react'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import OtpInput from '@/components/shared/OtpInput'
import sleep from '@/utils/sleep'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth' // ✅ ADD THIS
import type { CommonProps } from '@/@types/common'

interface OtpVerificationFormProps extends CommonProps {
    setOtpVerified?: (message: string) => void
    setMessage?: (message: string) => void
}

type ForgotPasswordFormSchema = {
    otp: string
}

const OTP_LENGTH = 6

const validationSchema = z.object({
    otp: z.string().min(OTP_LENGTH, { message: 'Please enter a valid OTP' }),
})

const OtpVerificationForm = (props: OtpVerificationFormProps) => {
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const navigate = useNavigate()
    const { signIn } = useAuth() // ✅ INIT AUTH

    const { className, setMessage, setOtpVerified } = props

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<ForgotPasswordFormSchema>({
        resolver: zodResolver(validationSchema),
    })

    const onOtpSend = async (values: ForgotPasswordFormSchema) => {

        console.log("submit")
        setSubmitting(true)

        try {

            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    phoneNumber: localStorage.getItem("loginPhone"),
                    otp: values.otp,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setMessage?.(data.message)
                return
            }

            setOtpVerified?.("OTP Verified Successfully")

            navigate("/dashboards/ecommerce")

        } catch (err) {
            setMessage?.("Verification failed")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className={className}>
            <Form onSubmit={handleSubmit(onOtpSend)}>
                <FormItem
                    invalid={Boolean(errors.otp)}
                    errorMessage={errors.otp?.message}
                >
                    <Controller
                        name="otp"
                        control={control}
                        render={({ field }) => (
                            <OtpInput
                                inputClass="h-[58px]"
                                length={OTP_LENGTH}
                                {...field}
                            />
                        )}
                    />
                </FormItem>

                <Button
                    block
                    loading={isSubmitting}
                    variant="solid"
                    type="submit"
                >
                    {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                </Button>
            </Form>
        </div>
    )
}

export default OtpVerificationForm