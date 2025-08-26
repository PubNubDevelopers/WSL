export const enum BoxType {
  InfoBoxWithImageAndQuantity = 0,
  InfoBoxComparingTwoStatistics = 1,
  InfoBoxWithImageAndTwoData = 2,
  FeatureStats = 3,
}

export const surfStatsConfig = {
  statBox1: {
    type: BoxType.InfoBoxComparingTwoStatistics,
    title: "Heat Score",
    info: [
      {
        stat: "8.7",
        imageUrl: "/matchstats/playericon_mbappe.png",
        imageAlt: "Griffin Colapinto",
        imageWidth: 32,
        imageHeight: 32,
      },
      {
        stat: "7.3",
        imageUrl: "/matchstats/playericon_silva.png",
        imageAlt: "John John Florence",
        imageWidth: 32,
        imageHeight: 32,
      },
    ],
  },
  statBox2: {
    type: BoxType.InfoBoxWithImageAndQuantity,
    title: "Wave Count",
    info: [
      {
        stat: "12",
        imageUrl: "/icons/loading.png",
        imageAlt: "Waves ridden",
        imageWidth: 31,
        imageHeight: 40,
      },
    ],
  },
  statBox3: {
    type: BoxType.InfoBoxWithImageAndTwoData,
    title: "Top Wave",
    info: [
      {
        dataPrimary: "9.2",
        dataSecondary: "Griffin Colapinto",
        imageUrl: "/matchstats/playericon_mbappe.png",
        imageAlt: "Top scoring wave",
        imageWidth: 48,
        imageHeight: 48,
      },
    ],
  },
  statBox4: {
    type: BoxType.InfoBoxComparingTwoStatistics,
    title: "Barrel Time",
    info: [
      {
        stat: "4.2s",
        imageUrl: "/matchstats/playericon_mbappe.png",
        imageAlt: "Griffin Colapito",
        imageWidth: 32,
        imageHeight: 32,
      },
      {
        stat: "2.8s",
        imageUrl: "/matchstats/playericon_silva.png",
        imageAlt: "John John Florence",
        imageWidth: 32,
        imageHeight: 32,
      },
    ],
  },
  statBox5: {
    type: BoxType.InfoBoxWithImageAndQuantity,
    title: "Priority",
    info: [
      {
        stat: "Griffin",
        imageUrl: "/icons/start.svg",
        imageAlt: "Surfer with priority",
        imageWidth: 31,
        imageHeight: 40,
      },
    ],
  },
  statBox6: {
    type: BoxType.InfoBoxComparingTwoStatistics,
    title: "Wave Selection",
    info: [
      {
        stat: "85%",
        imageUrl: "/matchstats/playericon_mbappe.png",
        imageAlt: "Griffin Colapinto",
        imageWidth: 32,
        imageHeight: 32,
      },
      {
        stat: "72%",
        imageUrl: "/matchstats/playericon_silva.png",
        imageAlt: "John John Florence",
        imageWidth: 32,
        imageHeight: 32,
      },
    ],
  },
  featuredSurfers: [
    {
      type: BoxType.FeatureStats,
      title: "Surfer profile: Griffin Colapinto",
      imageUrl: "/matchstats/statsbox_header_rodri.png",
      imageAlt: "Griffin Colapinto",
      imageWidth: 142,
      imageHeight: 80,
      headerBackgroundColor: "#0ea5e9",
      info: [
        { heading: "Full name:", detail: "Griffin Colapinto" },
        { heading: "Nationality:", detail: "USA" },
        { heading: "Stance:", detail: "Regular" },
        { heading: "Home break:", detail: "San Clemente, CA" },
      ],
      infoListItems: {
        title: "Career Highlights",
        bullets: [
          "2024 - Pipeline Masters Final",
          "2023 - WSL Championship Tour",
          "2022 - Rookie of the Year",
        ],
      },
    },
    {
      type: BoxType.FeatureStats,
      title: "Surfer profile: John John Florence",
      imageUrl: "/matchstats/statsbox_header_piroe.png",
      imageAlt: "John John Florence",
      imageWidth: 142,
      imageHeight: 80,
      headerBackgroundColor: "#0ea5e9",
      info: [
        { heading: "Full name:", detail: "John John Florence" },
        { heading: "Nationality:", detail: "USA (Hawaii)" },
        { heading: "Stance:", detail: "Regular" },
        { heading: "Home break:", detail: "Pipeline, Oahu" },
      ],
      infoListItems: {
        title: "Career Highlights",
        bullets: [
          "2017 - World Champion",
          "2016 - World Champion",
          "Multiple Pipeline Masters",
        ],
      },
    },
  ],
};
