import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Skeleton,
  SkeletonText,
  Spacer,
  Stack,
  Text,
  useBoolean,
} from "@chakra-ui/react"
import moment from "moment"
import React from "react"
import { Tag, Thread, useClient } from "~/src/client"
import useLikeControl from "~/src/components/controls/LikeControl"
import {
  Broadcast,
  ChatSquareText,
  Flag,
  FlagFill,
  HandThumbsUpFill,
  ReplyFill,
  Star,
  StarFill,
} from "~/src/components/utils/Icons"
import { addToStar, removeFromStar } from "~src/enhanced_control"
import {
  LayoutStyle,
  useFortuneLayoutSettings,
  useFortuneSettingsRead,
} from "~src/settings"
import { parseThreadNotification } from "~src/utils"
import useNetworkLocalControl from "../controls/NetworkLocalControl"
import { tagToDisplayString, tagToObscureString } from "../utils/tag"
import { CollapseContent, Content } from "./Content"
import ThemeAvatar from "./ThemeAvatar"

interface ThreadComponentProps {
  thread: Thread
  key?: string
  showPostTime?: boolean
  showControl?: boolean
  onReply: React.MouseEventHandler<HTMLButtonElement>
  isMessage?: boolean
}

interface ThreadSkeletonProps {
  showControl?: boolean
}

export function ThreadSkeleton({ showControl }: ThreadSkeletonProps) {
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
          <Skeleton height="3" />
          <Skeleton height="8" />
          <SkeletonText spacing="3" noOfLines={4} />
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
          <Text fontSize="sm">
            <ChatSquareText />
          </Text>
          <Text fontSize="sm">
            <Broadcast />
          </Text>
          {showControl && (
            <>
              <Skeleton height="6" />
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

export function ThreadTag({
  tag,
  obscureTag,
}: {
  tag: Tag
  obscureTag: boolean
}) {
  return (
    <Text fontSize="sm">
      <Badge colorScheme="teal">
        {obscureTag ? tagToObscureString(tag) : tagToDisplayString(tag)}
      </Badge>
    </Text>
  )
}

export function ThreadComponent({
  thread,
  showPostTime,
  showControl,
  onReply,
  isMessage,
}: ThreadComponentProps) {
  const client = useClient()

  const payload = { postId: thread.ThreadID }
  const [
    likeTextControl,
    likeButtonControl,
    likeTextButtonControl,
  ] = useLikeControl({
    clientWhetherLike: thread.WhetherLike ?? 0,
    clientCurrentLike: thread.Like - thread.Dislike,
    onCancelLike: () => client.cancelLikePost(payload),
    onLike: () => client.likePost(payload),
    onCancelDislike: () => client.cancelDislikePost(payload),
    onDislike: () => client.dislikePost(payload),
  })

  const settings = useFortuneSettingsRead()

  const favourControl = useNetworkLocalControl({
    clientState: thread.WhetherFavour === 1,
    doAction: () =>
      client
        .favorPost(payload)
        .then(() => settings.enhancedMode.enableStar && addToStar(thread)),
    cancelAction: () =>
      client
        .defavorPost(payload)
        .then(
          () =>
            settings.enhancedMode.enableStar && removeFromStar(thread.ThreadID)
        ),
    failedText: "无法收藏",
    doneComponent: (
      <>
        <StarFill /> &nbsp; 已收藏
      </>
    ),
    initialComponent: (
      <>
        <Star /> &nbsp; 收藏
      </>
    ),
  })

  const reportControl = useNetworkLocalControl({
    clientState: thread.WhetherReport === 1,
    doAction: () => client.report(payload),
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

  const [collapsed, setCollapsed] = useBoolean(true)

  const layoutSettings = useFortuneLayoutSettings()
  const obscureTag = useFortuneSettingsRead().obscureTag

  return (
    <Flex
      width="100%"
      onMouseOver={setCollapsed.off}
      onMouseOut={setCollapsed.on}
    >
      <Box
        flex="1"
        px={layoutSettings.cardPaddingX}
        py={layoutSettings.cardPaddingY}
        shadow="sm"
        borderWidth="1px"
        borderRadius="md"
      >
        <Stack spacing={layoutSettings.cardSpacing}>
          <Flex>
            <Text fontSize="sm">
              <Badge colorScheme="gray" className="maf-text-selectable">
                # {thread.ThreadID}
              </Badge>
            </Text>

            {thread.Tag !== Tag.Normal && (
              <Box ml={2}>
                <ThreadTag tag={thread.Tag} obscureTag={obscureTag} />
              </Box>
            )}

            {showControl && (
              <ThemeAvatar
                theme={thread.AnonymousType}
                seed={thread.RandomSeed}
                id={0}
              />
            )}
            <Spacer />
            <Text fontSize="sm" color="gray.500">
              {moment(
                showPostTime ? thread.PostTime : thread.LastUpdateTime
              ).calendar()}
            </Text>
            {isMessage && (
              <Text
                fontSize="sm"
                ml="2"
                color={thread.Judge === 0 ? "teal.500" : "gray.500"}
              >
                · {parseThreadNotification(thread)}
              </Text>
            )}
          </Flex>
          <Heading fontSize="md" className="maf-text-selectable">
            {thread.Title}
          </Heading>
          {showControl ? (
            <Content content={thread.Summary} showControl />
          ) : (
            <CollapseContent
              content={thread.Summary}
              collapsed={collapsed}
              maxLines={
                layoutSettings.style === LayoutStyle.compact ? "min" : "auto"
              }
            />
          )}

          {/* Small screen controls */}
          <Box display={{ base: "block", md: "none" }}>
            <Stack color="teal.500">
              <HStack justifyContent="space-between" spacing={4}>
                <Spacer />
                <Text fontSize="sm">
                  <ChatSquareText /> {thread.Comment}
                </Text>
                <Text fontSize="sm">
                  <Broadcast /> {thread.Read}
                </Text>
              </HStack>

              {showControl && (
                <HStack justifyContent="space-between">
                  {likeTextButtonControl}
                  <HStack>
                    {favourControl}
                    {reportControl}
                    <Button
                      colorScheme="teal"
                      size="xs"
                      variant="outline"
                      onClick={onReply}
                    >
                      <ReplyFill /> &nbsp; 回复
                    </Button>
                  </HStack>
                </HStack>
              )}
            </Stack>
          </Box>
        </Stack>
      </Box>

      {/* Large screen controls */}
      <Box
        size="80px"
        py={layoutSettings.controlMargin}
        px={layoutSettings.cardPaddingX}
        display={{ base: "none", md: "unset" }}
      >
        <Stack
          color="teal.500"
          width="80px"
          spacing={layoutSettings.controlSpacing}
        >
          {likeTextControl}
          <Text fontSize="sm">
            <ChatSquareText /> {thread.Comment}
          </Text>
          <Text fontSize="sm">
            <Broadcast /> {thread.Read}
          </Text>
          {showControl && (
            <>
              {likeButtonControl}
              {favourControl}
              {reportControl}
              <Button
                colorScheme="teal"
                size="xs"
                variant="outline"
                onClick={onReply}
              >
                <ReplyFill /> &nbsp; 回复
              </Button>
            </>
          )}
        </Stack>
      </Box>
    </Flex>
  )
}
