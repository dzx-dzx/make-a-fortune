import { Tag } from "~src/client"

export function tagToDisplayString(tag: Tag): string {
  switch (tag) {
    case Tag.Sex:
      return "性相关"
    case Tag.Politics:
      return "政治相关"
    case Tag.Uncomfort:
      return "令人不适"
    case Tag.Unproved:
      return "未经证实"
    case Tag.War:
      return "引战"
    case Tag.Normal:
      return "常规内容"
  }
}

export function tagToObscureString(tag: Tag): string {
  switch (tag) {
    case Tag.Sex:
      return "SE"
    case Tag.Politics:
      return "PO"
    case Tag.Uncomfort:
      return "UC"
    case Tag.Unproved:
      return "UP"
    case Tag.War:
      return "WA"
    case Tag.Normal:
      return "N"
  }
}
