export type EducationVideo = {
  slug: string;
  title: string;
  description: string;
  category: string;

  youtubeId: string;

  introduction: string;

  steps: {
    title: string;
    description: string;
  }[];

  commonProblems?: {
    title: string;
    description: string;
  }[];
};

export const educationVideos: EducationVideo[] = [
  {
    slug: "how-to-install-expert-advisor-mt5",

    title: "How to Install an Expert Advisor in MetaTrader 5",

    description:
      "Learn how to correctly install, load and run an Expert Advisor in MetaTrader 5.",

    category: "MetaTrader 5",

    // REPLACE THIS WITH YOUR REAL YOUTUBE VIDEO ID
    youtubeId: "YOUR_VIDEO_ID",

    introduction:
      "In this tutorial, you will learn how to install an Expert Advisor in MetaTrader 5 and attach it to a trading chart.",

    steps: [
      {
        title: "Open MetaTrader 5",
        description:
          "Start MetaTrader 5 and make sure you are connected to your trading account.",
      },

      {
        title: "Open the Data Folder",
        description:
          "From the MetaTrader menu, select File and then Open Data Folder.",
      },

      {
        title: "Open the Experts Folder",
        description:
          "Navigate to MQL5 and then open the Experts folder.",
      },

      {
        title: "Copy Your Expert Advisor",
        description:
          "Copy the EA file into the Experts folder.",
      },

      {
        title: "Refresh MetaTrader",
        description:
          "Return to MetaTrader and refresh the Expert Advisors section in the Navigator window.",
      },

      {
        title: "Attach the EA to a Chart",
        description:
          "Drag the Expert Advisor from the Navigator onto the chart you want to trade.",
      },

      {
        title: "Enable Algo Trading",
        description:
          "Make sure Algo Trading is enabled so the Expert Advisor can operate.",
      },
    ],

    commonProblems: [
      {
        title: "The EA does not appear",
        description:
          "Make sure the EA file was copied into the correct MQL5/Experts directory and refresh the Navigator.",
      },

      {
        title: "The EA is not trading",
        description:
          "Check that Algo Trading is enabled and review the Expert and Journal tabs for errors.",
      },

      {
        title: "Wrong MetaTrader version",
        description:
          "An MT4 Expert Advisor cannot run directly in MetaTrader 5. Make sure you are using the correct version.",
      },
    ],
  },

  {
  slug: "how-to-enable-algo-trading-mt5",

  title: "How to Enable Algo Trading in MetaTrader 5",

  description:
    "Learn how to correctly enable algorithmic trading in MetaTrader 5.",

  category: "MetaTrader 5",

  youtubeId: "SECOND_VIDEO_ID",

  introduction:
    "This guide explains how to enable Algo Trading and the permissions required by Expert Advisors.",

  steps: [
    {
      title: "Open MetaTrader 5",
      description:
        "Start your MetaTrader 5 terminal.",
    },

    {
      title: "Find Algo Trading",
      description:
        "Locate the Algo Trading button in the MetaTrader toolbar.",
    },

    {
      title: "Enable It",
      description:
        "Click the button and verify that automated trading is enabled.",
    },
  ],
},

];

