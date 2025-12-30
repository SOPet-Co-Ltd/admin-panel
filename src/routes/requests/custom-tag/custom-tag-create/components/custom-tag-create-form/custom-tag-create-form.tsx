import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Heading, Input, Text, toast, Select } from "@medusajs/ui"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"
import { z } from "zod"
import { Form } from "@/components/common/form"
import {
  RouteFocusModal,
  useRouteModal,
} from "@/components/modals"
import { KeyboundForm } from "@/components/utilities/keybound-form"
import { useCreateCustomTag } from "@/hooks/api/custom-tags"

const CustomTagCreateSchema = z.object({
  value: z.string().min(1, "Tag value is required"),
  type: z.enum(["pet_type", "brand"], {
    required_error: "Tag type is required",
  }),
})

export const CustomTagCreateForm = () => {
  const { t } = useTranslation()
  const { handleSuccess } = useRouteModal()
  const { mutateAsync: createCustomTag, isPending } = useCreateCustomTag()
  const { state } = useLocation()

  const defaultType =
    (state as { type?: "pet_type" | "brand" } | null)?.type === "brand"
      ? "brand"
      : "pet_type"

  const form = useForm<z.infer<typeof CustomTagCreateSchema>>({
    defaultValues: {
      value: "",
      type: defaultType,
    },
    resolver: zodResolver(CustomTagCreateSchema),
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await createCustomTag({
        type: data.type,
        value: data.value.trim(),
      })
      
      toast.success(t("customTags.create.successToast", { value: data.value }))
      handleSuccess()
    } catch (error) {
      toast.error(
        error instanceof Error 
          ? error.message 
          : t("general.somethingWentWrong")
      )
    }
  })

  return (
    <RouteFocusModal.Form form={form}>
      <KeyboundForm
        className="flex size-full flex-col overflow-hidden"
        onSubmit={handleSubmit}
      >
        <RouteFocusModal.Header />
        <RouteFocusModal.Body className="flex flex-1 justify-center overflow-auto px-6 py-16">
          <div className="flex w-full max-w-[720px] flex-col gap-y-8">
            <div className="flex flex-col gap-y-1">
              <RouteFocusModal.Title asChild>
                <Heading>{t("customTags.create.header")}</Heading>
              </RouteFocusModal.Title>
              <RouteFocusModal.Description asChild>
                <Text className="text-ui-fg-subtle">
                  {t("customTags.create.subtitle")}
                </Text>
              </RouteFocusModal.Description>
            </div>
            <div className="flex flex-col gap-y-4">
              <Form.Field
                control={form.control}
                name="type"
                render={({ field: { value, onChange, ...field } }) => {
                  return (
                    <Form.Item>
                      <Form.Label>{t("customTags.fields.type")}</Form.Label>
                      <Form.Control>
                        <Select value={value} onValueChange={onChange} {...field}>
                          <Select.Trigger>
                            <Select.Value placeholder={t("customTags.fields.typePlaceholder")} />
                          </Select.Trigger>
                          <Select.Content>
                            <Select.Item value="pet_type">
                              {t("petTypes.domain")}
                            </Select.Item>
                            <Select.Item value="brand">
                              {t("brands.domain")}
                            </Select.Item>
                          </Select.Content>
                        </Select>
                      </Form.Control>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )
                }}
              />
              <Form.Field
                control={form.control}
                name="value"
                render={({ field }) => {
                  return (
                    <Form.Item>
                      <Form.Label>{t("customTags.fields.value")}</Form.Label>
                      <Form.Control>
                        <Input {...field} placeholder={t("customTags.fields.valuePlaceholder")} />
                      </Form.Control>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )
                }}
              />
            </div>
          </div>
        </RouteFocusModal.Body>
        <RouteFocusModal.Footer>
          <div className="flex items-center justify-end gap-x-2">
            <RouteFocusModal.Close asChild>
              <Button size="small" variant="secondary">
                {t("actions.cancel")}
              </Button>
            </RouteFocusModal.Close>
            <Button size="small" type="submit" isLoading={isPending || form.formState.isSubmitting}>
              {t("actions.save")}
            </Button>
          </div>
        </RouteFocusModal.Footer>
      </KeyboundForm>
    </RouteFocusModal.Form>
  )
}
