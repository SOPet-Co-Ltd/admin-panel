import { useParams } from "react-router-dom"

import { MetadataForm } from "../../../components/forms/metadata-form"
import { RouteDrawer } from "../../../components/modals"
import { useRegion, useUpdateRegion } from "../../../hooks/api"

export const RegionMetadata = () => {
  const { id } = useParams()

  const { region, isPending, isError, error } = useRegion(id!)
  const { mutateAsync, isPending: isMutating } = useUpdateRegion(id!)

  if (isError) {
    throw error
  }

  return (
    <RouteDrawer data-testid="region-metadata-drawer">
      <MetadataForm
        isPending={isPending}
        isMutating={isMutating}
        hook={mutateAsync}
        metadata={region?.metadata}
      />
    </RouteDrawer>
  )
}
