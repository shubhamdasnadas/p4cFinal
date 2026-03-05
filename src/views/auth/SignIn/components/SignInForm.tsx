import { useState, useMemo } from 'react'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import Select, { Option as DefaultOption } from '@/components/ui/Select'
import Avatar from '@/components/ui/Avatar'
import NumericInput from '@/components/shared/NumericInput'
import { countryList } from '@/constants/countries.constant'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { components } from 'react-select'
import OtpVerificationBase from '../../OtpVerification/OtpVerification'
import type { ControlProps, OptionProps } from 'react-select'
import type { CommonProps } from '@/@types/common'
import type { Dispatch, SetStateAction, ReactNode } from 'react'

interface SignInFormProps extends CommonProps {
    disableSubmit?: boolean
    setMessage: Dispatch<SetStateAction<string>>
    passwordHint?: ReactNode
}

type CountryOption = {
    label: string
    dialCode: string
    value: string
}

type SignInFormSchema = {
    dialCode: string
    phoneNumber: string
}

const validationSchema = z.object({
    dialCode: z.string().min(1, { message: 'Select country code' }),
    phoneNumber: z.string().min(6, { message: 'Enter valid phone number' }),
})

const { Control } = components

const CustomSelectOption = (props: OptionProps<CountryOption>) => (
    <DefaultOption<CountryOption>
        {...props}
        customLabel={(data) => (
            <span className="flex items-center gap-2">
                <Avatar
                    shape="circle"
                    size={20}
                    src={`/img/countries/${data.value}.png`}
                />
                <span>{data.dialCode}</span>
            </span>
        )}
    />
)

const CustomControl = ({ children, ...props }: ControlProps<CountryOption>) => {
    const selected = props.getValue()[0]
    return (
        <Control {...props}>
            {selected && (
                <Avatar
                    shape="circle"
                    size={20}
                    src={`/img/countries/${selected.value}.png`}
                />
            )}
            {children}
        </Control>
    )
}

const SignInForm = ({
    disableSubmit = false,
    className,
    setMessage,
    passwordHint,
}: SignInFormProps) => {
    const [isSubmitting, setSubmitting] = useState(false)
    const [showOtpScreen, setShowOtpScreen] = useState(false)

    const dialCodeList = useMemo(() => {
        return countryList.map((country) => ({
            ...country,
            label: country.dialCode,
        }))
    }, [])

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<SignInFormSchema>({
        defaultValues: {
            dialCode: '+91',
            phoneNumber: '',
        },
        resolver: zodResolver(validationSchema),
    })

    const handleSendOtp = async (values: SignInFormSchema) => {
        if (disableSubmit) return
        console.log("send")

        try {
            setSubmitting(true)
            setMessage('')

            const phoneNumber = values.dialCode + values.phoneNumber

            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ phoneNumber }),
            })

            const data = await res.json()

            if (!res.ok) {
                setMessage(data.message)
                setSubmitting(false)
                return
            }

            setShowOtpScreen(true)

        } catch (error: any) {
            setMessage(error.message || "Failed to send OTP")
        } finally {
            setSubmitting(false)
        }
    }

    // ✅ Show OTP screen
    if (showOtpScreen) {
        return (
            <div className={className}>
                <OtpVerificationBase />
            </div>
        )
    }

    return (
        <div className={className}>
            <Form onSubmit={handleSubmit(handleSendOtp)}>
                <div className="flex items-end gap-4 w-full mb-4">
                    <FormItem
                        invalid={!!errors.dialCode}
                        errorMessage={errors.dialCode?.message}
                    >
                        <label className="form-label mb-2">
                            Phone number Update
                        </label> 

                        <Controller
                            name="dialCode"
                            control={control}
                            render={({ field }) => (
                                <Select<CountryOption>
                                    options={dialCodeList}
                                    className="w-[150px]"
                                    components={{
                                        Option: CustomSelectOption,
                                        Control: CustomControl,
                                    }}
                                    value={
                                        dialCodeList.find(
                                            (option) =>
                                                option.dialCode === field.value
                                        ) || null
                                    }
                                    onChange={(option) =>
                                        field.onChange(option?.dialCode || '')
                                    }
                                />
                            )}
                        />
                    </FormItem>

                    <FormItem
                        className="w-full"
                        invalid={!!errors.phoneNumber}
                        errorMessage={errors.phoneNumber?.message}
                    >
                        <Controller
                            name="phoneNumber"
                            control={control}
                            render={({ field }) => (
                                <NumericInput
                                    autoComplete="off"
                                    placeholder="Phone Number"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                </div>

                <Button
                    block
                    loading={isSubmitting}
                    variant="solid"
                    type="submit"
                >
                    {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
                </Button>

                {/* ✅ render password hint if passed */}
                {passwordHint}
            </Form>
        </div>
    )
}

export default SignInForm