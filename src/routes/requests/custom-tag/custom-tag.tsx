import { Container, Heading, Table, Tabs, Text, toast, DropdownMenu, StatusBadge, Checkbox, Button } from "@medusajs/ui"
import { EllipsisHorizontal, Trash, Plus, ArrowUpTray } from "@medusajs/icons"
import { useTranslation } from "react-i18next"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { SingleColumnPage } from "@/components/layout/pages"
import { useProductTags } from "@/hooks/api/tags"
import {
  useCustomTags,
  useApproveCustomTag,
  useRejectCustomTag,
  useAffectedProducts,
  useDeleteCustomTags,
  type CustomTag,
  type AffectedProduct,
} from "@/hooks/api/custom-tags"
import { formatDate } from "@/lib/date"
import { DeleteConfirmationModal } from "@/routes/requests/custom-tag/components/delete-confirmation-modal"

const PAGE_SIZE = 20

export const CustomTagRequest = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<"pet_types" | "brands" | "all_tags">("pet_types")
  const [currentPage, setCurrentPage] = useState<number>(0)
  const [allTagsPage, setAllTagsPage] = useState<number>(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [affectedProducts, setAffectedProducts] = useState<AffectedProduct[]>([])
  const [tagsToDelete, setTagsToDelete] = useState<string[]>([])

  const currentType = useMemo(() => (activeTab === "pet_types" ? "pet_type" : "brand" as const), [activeTab])

  const { tags = [], count = 0, isLoading, refetch } = useCustomTags(
    {
      type: currentType,
      limit: PAGE_SIZE,
      offset: currentPage * PAGE_SIZE,
      order: "-status",
    },
    { enabled: activeTab !== "all_tags" }
  )

  const { product_tags: allTagsList = [], count: allTagsCount = 0, isPending: isLoadingAll } = useProductTags(
    {
      limit: PAGE_SIZE,
      offset: allTagsPage * PAGE_SIZE,
    },
    { enabled: activeTab === "all_tags" }
  )

  const affectedProductsMutation = useAffectedProducts()
  const deleteTagsMutation = useDeleteCustomTags()

  // Actions are handled per-row in CustomTagActions to respect React hook rules

  const handleSelectAll = () => {
    const selectableTags = tags.filter((tag: CustomTag) => tag.status !== "pending")
    if (selectedIds.size === selectableTags.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(selectableTags.map((tag: CustomTag) => tag.id)))
    }
  }

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleDeleteClick = async (ids: string[]) => {
    setTagsToDelete(ids)
    
    try {
      const result = await affectedProductsMutation.mutateAsync({ ids })
      setAffectedProducts(result.products)
      setShowDeleteModal(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to check affected products"
      toast.error(message)
    }
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteTagsMutation.mutateAsync({ ids: tagsToDelete })
      toast.success(t("customTags.delete.successToast"))
      setShowDeleteModal(false)
      setSelectedIds(new Set())
      setTagsToDelete([])
      setAffectedProducts([])
      refetch()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete tags"
      toast.error(message)
    }
  }

  const handleCloseModal = () => {
    setShowDeleteModal(false)
    setTagsToDelete([])
    setAffectedProducts([])
  }

  return (
    <SingleColumnPage widgets={{after:[],before:[]}}>
      <Container>
        <div className="flex items-center justify-between">
          <div>
            <Heading level="h2">{t("customTags.requestsTitle")}</Heading>
            <Text className="text-ui-fg-subtle">{t("customTags.requestsSubtitle")}</Text>
          </div>
          <div className="flex items-center gap-x-2">
            <Button
              size="small"
              variant="secondary"
              onClick={() => {
                // TODO: Implement import functionality
                toast.info("Import functionality coming soon")
              }}
            >
              <ArrowUpTray />
              {t("actions.import")}
            </Button>
            <Button
              size="small"
              variant="secondary"
              onClick={() => navigate("create", { state: { type: currentType } })}
            >
              <Plus />
              {t("actions.create")}
            </Button>
          </div>
        </div>
      </Container>

      <Container>
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value as "pet_types" | "brands" | "all_tags")
            // Reset paginations appropriately when switching
            if (value === "all_tags") {
              setAllTagsPage(0)
            } else {
              setCurrentPage(0)
            }
          }}
          className="w-full"
        >
          <div className="pt-4 mb-4">
            <Tabs.List>
              <Tabs.Trigger value="pet_types">{t("petTypes.domain")}</Tabs.Trigger>
              <Tabs.Trigger value="brands">{t("brands.domain")}</Tabs.Trigger>
            </Tabs.List>
          </div>

          <div className="flex size-full flex-col overflow-hidden pt-2">
            {activeTab !== "all_tags" ? (
              <>
                {isLoading && <Text>{t("customTags.loading")}</Text>}
                {!isLoading && tags.length === 0 ? (
                  <div className="py-4">
                    <Text className="text-ui-fg-subtle">{t("customTags.noPendingRequests")}</Text>
                  </div>
                ) : (
                  <>
                    {selectedIds.size > 0 && (
                      <div className="mb-4 flex items-center gap-2">
                        <Button
                          variant="danger"
                          size="small"
                          onClick={() => handleDeleteClick(Array.from(selectedIds))}
                        >
                          <Trash />
                          {t("customTags.delete.bulkAction", { count: selectedIds.size })}
                        </Button>
                        <Text className="text-sm text-ui-fg-subtle">
                          {t("customTags.selectedCount", { count: selectedIds.size })}
                        </Text>
                      </div>
                    )}
                    <Table>
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell>
                            <Checkbox
                              checked={selectedIds.size > 0 && selectedIds.size === tags.filter((tag: CustomTag) => tag.status !== "pending").length && tags.filter((tag: CustomTag) => tag.status !== "pending").length > 0}
                              onCheckedChange={handleSelectAll}
                            />
                          </Table.HeaderCell>
                          <Table.HeaderCell>{t("customTags.name")}</Table.HeaderCell>
                          <Table.HeaderCell>{t("fields.date")}</Table.HeaderCell>
                          <Table.HeaderCell>{t("customTags.status")}</Table.HeaderCell>
                          <Table.HeaderCell>{t("customTags.actions")}</Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {tags.map((tag: CustomTag) => (
                          <Table.Row key={tag.id}>
                            <Table.Cell>
                              <Checkbox
                                checked={selectedIds.has(tag.id)}
                                onCheckedChange={() => handleSelectOne(tag.id)}
                                disabled={tag.status === "pending"}
                              />
                            </Table.Cell>
                            <Table.Cell>
                              <Text className="font-medium">{tag.value}</Text>
                            </Table.Cell>
                            <Table.Cell>
                              {formatDate(tag.created_at)}
                            </Table.Cell>
                            <Table.Cell>
                              <StatusBadge color={tag.status === "approved" ? "green" : tag.status === "rejected" ? "red" : "orange"}>
                                {tag.status}
                              </StatusBadge>
                            </Table.Cell>
                            <Table.Cell>
                              <CustomTagActions 
                                tag={tag} 
                                refetch={refetch} 
                                onDelete={() => handleDeleteClick([tag.id])}
                              />
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                    <Table.Pagination
                      canNextPage={PAGE_SIZE * (currentPage + 1) < count}
                      canPreviousPage={currentPage > 0}
                      previousPage={() => setCurrentPage((p) => p - 1)}
                      nextPage={() => setCurrentPage((p) => p + 1)}
                      count={count}
                      pageCount={Math.ceil(count / PAGE_SIZE)}
                      pageIndex={currentPage}
                      pageSize={PAGE_SIZE}
                    />
                  </>
                )}
              </>
            ) : (
              <>
                {isLoadingAll && <Text>{t("customTags.loading")}</Text>}
                {!isLoadingAll && allTagsList.length === 0 ? (
                  <div className="py-4">
                    <Text className="text-ui-fg-subtle">{t("general.noRecordsMessage")}</Text>
                  </div>
                ) : (
                  <>
                    <Table>
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell>{t("fields.value")}</Table.HeaderCell>
                          <Table.HeaderCell>{t("fields.createdAt")}</Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {allTagsList.map((tag) => (
                          <Table.Row key={tag.id}>
                            <Table.Cell>
                              <Text className="font-medium">{tag.value}</Text>
                            </Table.Cell>
                            <Table.Cell>{formatDate(tag.created_at)}</Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                    <Table.Pagination
                      canNextPage={PAGE_SIZE * (allTagsPage + 1) < allTagsCount}
                      canPreviousPage={allTagsPage > 0}
                      previousPage={() => setAllTagsPage((p) => p - 1)}
                      nextPage={() => setAllTagsPage((p) => p + 1)}
                      count={allTagsCount}
                      pageCount={Math.ceil(allTagsCount / PAGE_SIZE)}
                      pageIndex={allTagsPage}
                      pageSize={PAGE_SIZE}
                    />
                  </>
                )}
              </>
            )}
          </div>
        </Tabs>
      </Container>

      <DeleteConfirmationModal
        open={showDeleteModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        affectedProducts={affectedProducts}
        isLoading={deleteTagsMutation.isPending}
        tagCount={tagsToDelete.length}
      />
    </SingleColumnPage>
  )
}

function CustomTagActions({
  tag,
  refetch,
  onDelete,
}: {
  tag: CustomTag
  refetch: () => void
  onDelete: () => void
}) {
  const { t } = useTranslation()
  const approveMutation = useApproveCustomTag(tag.id)
  const rejectMutation = useRejectCustomTag(tag.id)

  const isPending = tag.status === "pending"
  const isApproved = tag.status === "approved"
  const isRejected = tag.status === "rejected"

  return (
    <DropdownMenu data-testid={`custom-tag-menu-${tag.id}`}>
      <DropdownMenu.Trigger asChild>
        <div data-testid={`custom-tag-menu-${tag.id}-trigger`}>
          <EllipsisHorizontal />
        </div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content data-testid={`custom-tag-menu-${tag.id}-content`}>
        {isPending && (
          <>
            <DropdownMenu.Item
              className="gap-x-2"
              onClick={() =>
                approveMutation.mutate(undefined, {
                  onSuccess: () => {
                    toast.success(t("customTags.approve.successToast"))
                    refetch()
                  },
                  onError: (error: Error) => {
                    toast.error(error?.message || "Failed to approve")
                  },
                })
              }
              data-testid={`custom-tag-menu-${tag.id}-approve`}
            >
              {t("customTags.approve.action")}
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="gap-x-2"
              onClick={() =>
                rejectMutation.mutate(
                  { reason: "Rejected by admin" },
                  {
                    onSuccess: () => {
                      toast.success(t("customTags.reject.successToast"))
                      refetch()
                    },
                    onError: (error: Error) => {
                      toast.error(error?.message || "Failed to reject")
                    },
                  },
                )
              }
              data-testid={`custom-tag-menu-${tag.id}-reject`}
            >
              {t("customTags.reject.action")}
            </DropdownMenu.Item>
          </>
        )}
        {(isApproved || isRejected) && (
          <DropdownMenu.Item
            className="gap-x-2 text-ui-fg-error"
            onClick={onDelete}
            data-testid={`custom-tag-menu-${tag.id}-delete`}
          >
            <Trash />
            {t("actions.delete")}
          </DropdownMenu.Item>
        )}
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}
