import React from "react";
import { Row } from "native-base";

import { BucketItem } from "./BucketItem";
import { useRandomVideos } from "../../../hooks/query/useRandomVideos";
import { useRandomUsers } from "../../../hooks/query/useRandomUsers";

const amount = 14;

export const BucketScreen = () => {
  const { data: profile } = useRandomUsers({ key: [{ amount }] });
  const { data: videos } = useRandomVideos({
    key: [{ per_page: amount, size: "small" }],
    select: (res) => res.videos,
  });

  if (!videos || !profile) return <></>;

  return (
    <Row flexWrap={"wrap"}>
      {videos.map((data, index) => (
        <BucketItem
          data={{ ...data, name: profile.results[index].location.city }}
          key={data.id}
        />
      ))}
    </Row>
  );
};
