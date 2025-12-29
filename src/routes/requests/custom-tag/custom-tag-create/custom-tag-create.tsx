import { RouteFocusModal } from "@/components/modals"
import { CustomTagCreateForm } from "@/routes/requests/custom-tag/custom-tag-create/components/custom-tag-create-form"

export const CustomTagCreate = () => {
  return (
    <RouteFocusModal>
      <CustomTagCreateForm />
    </RouteFocusModal>
  )
}
