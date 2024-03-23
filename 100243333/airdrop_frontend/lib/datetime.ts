import dayjs from "dayjs";

import { DAY_SECONDS, HOUR_SECONDS, MUNITE_SECONDS } from "../constants/misc";

export const getTimeFronNow = (value?: string | number) => {
  const startTimestamp =
    value && dayjs(value).isValid() ? dayjs(value).unix() : null;
  const nowTimeStamp = dayjs().unix();

  const deltaFromStartToNow = startTimestamp
    ? nowTimeStamp - startTimestamp
    : null;
  const timeFromNow =
    typeof deltaFromStartToNow === "number"
      ? deltaFromStartToNow < MUNITE_SECONDS
        ? "刚刚"
        : deltaFromStartToNow < HOUR_SECONDS
        ? `${Math.floor(deltaFromStartToNow / MUNITE_SECONDS)}分钟前`
        : deltaFromStartToNow < DAY_SECONDS
        ? `${Math.floor(deltaFromStartToNow / HOUR_SECONDS)}小时前`
        : `${Math.floor(deltaFromStartToNow / DAY_SECONDS)}天前`
      : "未知";
  return timeFromNow;
};
