import {
  Box,
  Button,
  Collapse,
  Flex,
  HStack,
  Skeleton,
  SkeletonText,
  Spacer,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react"
import moment from "moment"
import React, { useState } from "react"
import { Floor, useClient } from "~/src/client"
import useLikeControl from "~/src/components/controls/LikeControl"
import {
  ArrowBarDown,
  ArrowBarUp,
  ChevronRight,
  Flag,
  FlagFill,
  HandThumbsUpFill,
  ReplyFill,
} from "~/src/components/utils/Icons"
import { NameTheme } from "~src/name_theme"
import { useFortuneLayoutSettings } from "~src/settings"
import { handleError } from "~src/utils"
import useNetworkLocalControl from "../controls/NetworkLocalControl"
import { RequestFloor } from "../utils/types"
import { Content } from "./Content"
import ThemeAvatar from "./ThemeAvatar"

interface FloorComponentProps {
  floor: Floor
  key?: string
  theme: NameTheme
  seed: number
  threadId: string
  showControl?: boolean
  onReply?: Function
  allowExpand?: boolean
  requestFloor?: RequestFloor
}

export function FloorSkeleton({ showControl }: { showControl?: boolean }) {
  const layoutSettings = useFortuneLayoutSettings()

  return (
    <Flex width="100%">
      <Box
        flex="1"
        px={layoutSettings.cardPaddingX}
        py={layoutSettings.cardPaddingY}
        shadow="sm"
        borderWidth="1px"
        borderRadius="md"
      >
        <Stack spacing={layoutSettings.cardSpacing}>
          <Skeleton height="1rem" />
          <SkeletonText spacing="4" />
        </Stack>
      </Box>
      <Box
        size="80px"
        p={layoutSettings.controlMargin}
        display={{ base: "none", md: "unset" }}
      >
        <Stack
          color="teal.500"
          width="80px"
          spacing={layoutSettings.controlSpacing}
        >
          <Text fontSize="sm">
            <HandThumbsUpFill />
          </Text>
          {showControl && (
            <>
              <Skeleton height="6" />
              <Skeleton height="6" />
              <Skeleton height="6" />
            </>
          )}
        </Stack>
      </Box>
    </Flex>
  )
}

export function FloorComponent({
  floor,
  theme,
  seed,
  threadId,
  showControl,
  onReply,
  allowExpand,
  requestFloor,
}: FloorComponentProps) {
  const client = useClient()
  const payload = { postId: threadId, replyId: floor.FloorID }
  const [
    likeTextControl,
    likeButtonControl,
    likeTextButtonControl,
  ] = useLikeControl({
    clientWhetherLike: floor.WhetherLike,
    clientCurrentLike: floor.Like - floor.Dislike,
    onCancelLike: () => client.cancelLikeReply(payload),
    onLike: () => client.likeReply(payload),
    onCancelDislike: () => client.cancelDislikeReply(payload),
    onDislike: () => client.dislikeReply(payload),
  })

  const reportControl = useNetworkLocalControl({
    clientState: floor.WhetherReport === 1,
    doAction: () => client.reportReply(payload),
    failedText: "无法举报",
    doneComponent: (
      <>
        <FlagFill /> &nbsp; 已举报
      </>
    ),
    initialComponent: (
      <>
        <Flag /> &nbsp; 举报
      </>
    ),
    confirmComponent: <>确认举报</>,
    confirm: true,
  })

  const [stackedFloor, setStackedFloor] = useState<Floor>()
  const [expand, setExpand] = useState(false)
  const [isExpanding, setIsExpanding] = useState(false)

  const toast = useToast()

  const layoutSettings = useFortuneLayoutSettings()

  const doExpand = () => {
    setIsExpanding(true)
    requestFloor?.(floor.Replytofloor.toString())
      .then((newFloor) => {
        if (!newFloor) {
          toast({
            title: `无法展开第 ${floor.Replytofloor} 楼`,
            description: "请稍候重试",
            isClosable: true,
            duration: 5000,
            status: "warning",
          })
          return
        }
        setExpand(true)
        setStackedFloor(newFloor)
      })
      .catch((err) => handleError(toast, "无法展开回复", err))
      .finally(() => setIsExpanding(false))
  }

  return (
    <Flex width="100%">
      <Box
        flex="1"
        px={layoutSettings.cardPaddingX}
        py={layoutSettings.cardPaddingY}
        shadow="sm"
        borderWidth="1px"
        borderRadius="md"
      >
        <Stack spacing={layoutSettings.cardSpacing}>
          <Box
            ml={-layoutSettings.cardPaddingX + 1}
            mr={-layoutSettings.cardPaddingX + 2}
            mt={-layoutSettings.cardPaddingY + 1}
          >
            <Collapse
              in={expand}
              onAnimationComplete={(definition) => {
                if (!expand && definition === "exit") setStackedFloor(undefined)
              }}
            >
              {stackedFloor && allowExpand && (
                <FloorComponent
                  floor={stackedFloor}
                  theme={theme}
                  seed={seed}
                  threadId={threadId}
                  allowExpand={allowExpand}
                  requestFloor={requestFloor}
                />
              )}
            </Collapse>
          </Box>
          <Flex alignItems="center">
            <HStack mr="2" ml={-2}>
              <ThemeAvatar
                theme={theme}
                seed={seed}
                id={parseInt(floor.Speakername)}
                showIsPoster
                floorId={parseInt(floor.FloorID)}
              />
            </HStack>
            {floor.Replytofloor !== 0 && (
              <>
                <Text fontSize="sm" mr="2" fontWeight="bold">
                  <ChevronRight />
                </Text>
                <HStack>
                  <ThemeAvatar
                    theme={theme}
                    seed={seed}
                    id={parseInt(floor.Replytoname)}
                    showIsPoster
                    floorId={floor.Replytofloor}
                  />
                </HStack>
                {allowExpand && !expand && (
                  <Button
                    ml="2"
                    size="xs"
                    variant="ghost"
                    colorScheme="teal"
                    isLoading={isExpanding}
                    onClick={doExpand}
                  >
                    <ArrowBarUp />
                  </Button>
                )}
                {expand && showControl && (
                  <Button
                    ml="2"
                    size="xs"
                    variant="ghost"
                    colorScheme="teal"
                    onClick={() => setExpand(false)}
                  >
                    <ArrowBarDown />
                  </Button>
                )}
              </>
            )}
            <Spacer />
            <Text fontSize="sm" color="gray.500">
              {moment(floor.RTime).calendar()}
            </Text>
          </Flex>
          <Content content={floor.Context} showControl={showControl} />
        </Stack>

        {/* Small screen controls */}
        {showControl && (
          <Box display={{ base: "block", md: "none" }} paddingTop={3}>
            <Stack color="teal.500">
              <HStack justifyContent="space-between">
                {likeTextButtonControl}
                <HStack>
                  {reportControl}
                  <Button
                    colorScheme="teal"
                    size="xs"
                    variant="outline"
                    onClick={() => onReply?.(floor)}
                  >
                    <ReplyFill /> &nbsp; 回复
                  </Button>
                </HStack>
              </HStack>
            </Stack>
          </Box>
        )}
      </Box>

      {/* Large screen controls */}
      {showControl && (
        <Box
          size="80px"
          py={layoutSettings.controlMargin}
          px={layoutSettings.cardPaddingX}
          display={{ base: "none", md: "unset" }}
          height="100%"
        >
          <Stack
            color="teal.500"
            width="80px"
            spacing={layoutSettings.controlSpacing}
          >
            {likeTextControl}
            {likeButtonControl}
            {reportControl}
            <Button
              colorScheme="teal"
              size="xs"
              variant="outline"
              onClick={() => onReply?.(floor)}
            >
              <ReplyFill /> &nbsp; 回复
            </Button>
          </Stack>
        </Box>
      )}
    </Flex>
  )
}
