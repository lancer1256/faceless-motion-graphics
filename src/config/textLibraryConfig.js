// src/config/textLibraryConfig.js

// Shared constants can be defined here or imported if they become numerous
const FONT_URL_SHARED = './assets/SF-Pro-Text-Bold.otf';
const TEXT_COLOR_SCENE_1_2 = 0xffffff;

export const textLibrary = {
    "s1_intro_main_phrase": {
        idForMesh: "Scene1Text_from_library",
        lines: [
            {
                lineId: "s1_line1_want_to",
                text: "if you want to",
                color: TEXT_COLOR_SCENE_1_2,
                textAlign: 'center', // New: Explicitly left-align this line
                animation: {
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.3,
                            ease: "power1.out"
                        },
                        {
                            target: "position",
                            from: { x: -1 },
                            to: { x: 0 },
                            duration: 0.3,
                            ease: "power2.out"
                        }
                    ]
                }
            },
            {
                lineId: "s1_line2_sell_online",
                text: "sell online",
                color: TEXT_COLOR_SCENE_1_2,
                // No textAlign here, will default to 'center' if logic is added
                // Example of making this line relative to the first (though not semantically useful here, just for schema demo)
                // textAlign: {
                // type: "relative",
                // targetLineId: "s1_line1_want_to",
                // positionInSpaceRelativeToLine: "center"
                // },
                animation: {
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.3,
                            ease: "power1.out"
                        },
                        {
                            target: "position",
                            from: { x: -1 },
                            to: { x: 0 },
                            duration: 0.3,
                            ease: "power2.out"
                        }
                    ]
                }
            }
        ],
        fontUrl: FONT_URL_SHARED,
        baseFontSize: [2.2, 4.2],
        widthTargets: [14.36, 19.16],
        gapSpec: { mode: "ratio", value: -0.3 },
        letterSpacingFactor: -0.2,
        wordSpacingFactor: 0.25,
        groupRotation: { x: -Math.PI * 0.1, y: -Math.PI * 0.05, z: 0 },
        lineZOffsets: [-2.1, 0],
        defaultAnimation: {
            granularity: "word",
            tweens: [
                {
                    target: "self",
                    from: { fillOpacity: 0 },
                    to: { fillOpacity: 1 },
                    duration: 0.3,
                    ease: "power1.out"
                },
                {
                    target: "position",
                    from: { x: -1 },
                    to: { x: 0 },
                    duration: 0.3,
                    ease: "power2.out"
                }
            ]
        }
    },
    "s2_resistance_phrase": {
        idForMesh: "Scene2Text_from_library",
        lines: [
            {
                text: "without",
                color: TEXT_COLOR_SCENE_1_2,
                animation: {
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.3,
                            ease: "power1.out"
                        },
                        {
                            target: "position",
                            from: { x: -1 },
                            to: { x: 0 },
                            duration: 0.3,
                            ease: "power2.out"
                        }
                    ]
                }
            },
            {
                text: "resistance",
                color: TEXT_COLOR_SCENE_1_2,
                animation: {
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.3,
                            ease: "power1.out"
                        },
                        {
                            target: "position",
                            from: { x: -1 },
                            to: { x: 0 },
                            duration: 0.3,
                            ease: "power2.out"
                        }
                    ]
                }
            }
        ],
        fontUrl: FONT_URL_SHARED,
        baseFontSize: [3.5, 3.5],
        widthTargets: [10.01, 19.71],
        gapSpec: { mode: "ratio", value: -0.3 },
        letterSpacingFactor: -0.2,
        wordSpacingFactor: 0.25,
        groupRotation: { x: -Math.PI * 0.1, y: -Math.PI * 0.05, z: 0 },
        defaultAnimation: {
            granularity: "word",
            tweens: [
                {
                    target: "self",
                    from: { fillOpacity: 0 },
                    to: { fillOpacity: 1 },
                    duration: 0.3,
                    ease: "power1.out"
                },
                {
                    target: "position",
                    from: { x: -1 },
                    to: { x: 0 },
                    duration: 0.3,
                    ease: "power2.out"
                }
            ]
        }
    },
    "s3_stop_acting_phrase": {
        idForMesh: "Scene3Text_from_library",
        lines: [
            {
                text: "stop acting",
                color: 0x333333,
                animation: {
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.3,
                            ease: "power1.out"
                        },
                        {
                            target: "position",
                            from: { x: -1 },
                            to: { x: 0 },
                            duration: 0.3,
                            ease: "power2.out"
                        }
                    ]
                }
            }
        ],
        fontUrl: FONT_URL_SHARED,
        baseFontSize: 3.8,
        widthTargets: [13.5],
        gapSpec: { mode: "ratio", value: -0.5 },
        letterSpacingFactor: -0.2,
        wordSpacingFactor: 0.20,
        groupRotation: { x: Math.PI * 0.05, y: 0.0, z: 0 },
        defaultAnimation: {
            granularity: "word",
            tweens: [
                {
                    target: "self",
                    from: { fillOpacity: 0 },
                    to: { fillOpacity: 1 },
                    duration: 0.3,
                    ease: "power1.out"
                },
                {
                    target: "position",
                    from: { x: -1 },
                    to: { x: 0 },
                    duration: 0.3,
                    ease: "power2.out"
                }
            ]
        }
    },
    "s4_like_youre_selling_phrase": {
        idForMesh: "Scene4Text_from_library",
        lines: [
            {
                text: "like",
                color: 0x333333,
                animation: {
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.3,
                            ease: "power1.out"
                        },
                        {
                            target: "position",
                            from: { x: -1 },
                            to: { x: 0 },
                            duration: 0.3,
                            ease: "power2.out"
                        }
                    ]
                }
            },
            {
                text: "you're selling",
                color: 0x333333,
                animation: {
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.3,
                            ease: "power1.out"
                        },
                        {
                            target: "position",
                            from: { x: -1 },
                            to: { x: 0 },
                            duration: 0.3,
                            ease: "power2.out"
                        }
                    ]
                }
            }
        ],
        fontUrl: FONT_URL_SHARED,
        baseFontSize: [2.5, 3.5],
        widthTargets: [5.01, 19.71],
        gapSpec: { mode: "ratio", value: -0.45 },
        letterSpacingFactor: -0.2,
        wordSpacingFactor: 0.20,
        groupRotation: { x: Math.PI * 0.05, y: 0.0, z: 0 },
        defaultAnimation: {
            granularity: "word",
            tweens: [
                {
                    target: "self",
                    from: { fillOpacity: 0 },
                    to: { fillOpacity: 1 },
                    duration: 0.3,
                    ease: "power1.out"
                },
                {
                    target: "position",
                    from: { x: -1 },
                    to: { x: 0 },
                    duration: 0.3,
                    ease: "power2.out"
                }
            ]
        }
    },
    "s5_think_marketing_phrase": {
        idForMesh: "Scene5Text_from_library",
        lines: [
            {
                text: "think of your",
                color: 0xffffff,
                animation: {
                    granularity: "word",
                    letterStagger: 0.02,
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.25,
                            ease: "power1.out"
                        },
                        {
                            target: "position",
                            from: { y: -1 },
                            to: { y: 0 },
                            duration: 0.25,
                            ease: "power2.out"
                        }
                    ]
                }
            },
            {
                text: "marketing",
                color: 0x4ad95a,
                animation: {
                    granularity: "letter",
                    letterStagger: 0.02,
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.25,
                            ease: "power1.out"
                        },
                        {
                            target: "position",
                            from: { x: 2 },
                            to: { x: 0 },
                            duration: 0.25,
                            ease: "power2.out"
                        },
                        {
                            target: "position",
                            from: { y: -7 },
                            to: { y: 0 },
                            duration: 0.2,
                            ease: "power2.out"
                        }
                    ]
                }
            }
        ],
        fontUrl: FONT_URL_SHARED,
        baseFontSize: [3.5, 4.0],
        widthTargets: [19.71, 22.00],
        gapSpec: { mode: "ratio", value: -0.38 },
        letterSpacingFactor: -0.2,
        wordSpacingFactor: 0.25,
        groupRotation: { x: Math.PI * 0.05, y: 0.0, z: 0 },
        lineZOffsets: [-2.1, 0],
        defaultAnimation: {}
    },
    "s6_as_phrase": {
        idForMesh: "Scene6Text_from_library",
        lines: [
            {
                text: "as",
                color: 0xffffff,
                animation: {
                    granularity: "word",
                    tweens: []
                }
            }
        ],
        fontUrl: FONT_URL_SHARED,
        baseFontSize: 5.0, // Larger font size for this short word
        widthTargets: [7.5],
        gapSpec: { mode: "ratio", value: -0.3 },
        letterSpacingFactor: -0.1,
        wordSpacingFactor: 0.25,
        groupRotation: { x: Math.PI * 0.05, y: 0.0, z: 0 },
        defaultAnimation: {}
    },
    "s7_on_the_outside_phrase": {
        idForMesh: "Scene7Text_from_library",
        lines: [
            {
                text: "On the outside",
                color: 0xffffff, // White text for contrast against black background
                textAlign: 'left',
                animation: { // Default animation for now, can be customized
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.3,
                            ease: "power1.out"
                        }
                    ]
                }
            },
            {
                text: "Value",
                color: 0xffffff, //
                textAlign: 'left',
                animation: {
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.3,
                            ease: "power1.out"
                        }
                    ]
                }
            },
            {
                text: "Entertainment",
                color: 0xffffff, 
                textAlign: 'left',
                animation: {
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.3,
                            ease: "power1.out"
                        }
                    ]
                }
            },
            {
                text: "Or curiosity",
                textAlign: 'left',
                color: 0xffffff,
                animation: {
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.3,
                            ease: "power1.out"
                        }
                    ]
                }
            }
        ],
        fontUrl: FONT_URL_SHARED,
        baseFontSize: [3.0, 3.0, 3.0, 3.0], // All font sizes set to 3.0 for consistency
        gapSpec: { mode: "ratio", value: .7 },
        letterSpacingFactor: -0.15,
        wordSpacingFactor: 0.20,
        groupRotation: { x: 0, y: 0, z: 0 }, // No group rotation for simpler text
        lineZOffsets: [0, 0, 0, 0], // Spread lines out in Z for depth
        defaultAnimation: { // This can be overridden per line
            granularity: "word",
            tweens: [
                {
                    target: "self",
                    from: { fillOpacity: 0 },
                    to: { fillOpacity: 1 },
                    duration: 0.3,
                    ease: "power1.out"
                },
                {
                    target: "position",
                    from: { y: -0.5 },
                    to: { y: 0 },
                    duration: 0.3,
                    ease: "power2.out"
                }
            ]
        }
    },
    "s8_inside_your_offer_phrase": {
        idForMesh: "Scene8Text_from_library",
        lines: [
            {
                text: "Inside:",
                color: 0xffffff,
                textAlign: 'center',
                animation: {
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.3,
                            ease: "power1.out"
                        }
                    ]
                }
            },
            {
                text: "Your Offer",
                color: 0xffffff,
                textAlign: 'center',
                animation: {
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.3,
                            ease: "power1.out"
                        }
                    ]
                }
            }
        ],
        fontUrl: FONT_URL_SHARED,
        baseFontSize: [3.0, 3.0],
        gapSpec: { mode: "ratio", value: .5 },
        letterSpacingFactor: -0.15,
        wordSpacingFactor: 0.20,
        groupRotation: { x: 0, y: 0, z: 0 },
        lineZOffsets: [0, 0],
        defaultAnimation: {
            granularity: "word",
            tweens: [
                {
                    target: "self",
                    from: { fillOpacity: 0 },
                    to: { fillOpacity: 1 },
                    duration: 0.3,
                    ease: "power1.out"
                }
            ]
        }
    },
    "s9_instead_of_phrase": {
        idForMesh: "Scene9Text_from_library",
        lines: [
            {
                text: "Instead of",
                color: 0xffffff,
                textAlign: 'center'
            }
        ],
        fontUrl: FONT_URL_SHARED,
        baseFontSize: [3.5],
        gapSpec: { mode: "ratio", value: .5 },
        letterSpacingFactor: -0.15,
        wordSpacingFactor: 0.20,
        groupRotation: { x: 0, y: 0, z: 0 },
        lineZOffsets: [0],
        defaultAnimation: {
            granularity: "word",
            tweens: [
                {
                    target: "self",
                    from: { fillOpacity: 0 },
                    to: { fillOpacity: 1 },
                    duration: 0.3,
                    ease: "power1.out"
                },
                {
                    target: "position",
                    from: { x: -2 },
                    to: { x: 0 },
                    duration: 0.2,
                    ease: "power1.out"
                }
            ]
        }
    },
    "s10_buy_these_socks_phrase": {
        idForMesh: "Scene10Text_from_library",
        lines: [
            {
                text: "buy these socks",
                color: 0xffffff,
                textAlign: 'center',
                animation: {
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.3,
                            ease: "power1.out"
                        },
                        {
                            target: "position",
                            from: { y: -1 },
                            to: { y: 0 },
                            duration: 0.3,
                            ease: "power2.out"
                        }
                    ]
                }
            }
        ],
        fontUrl: FONT_URL_SHARED,
        baseFontSize: [1.7],
        gapSpec: { mode: "ratio", value: -0.2 },
        letterSpacingFactor: -0.15,
        wordSpacingFactor: 0.25,
        groupRotation: { x: 0, y: 0, z: 0 },
        lineZOffsets: [0],
        defaultAnimation: {}
    },
    "s11_feet_hurt_phrase": {
        idForMesh: "Scene11Text_from_library",
        lines: [
            {
                text: "say ever wonder",
                color: 0xffffff,
                animation: {
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.3,
                            ease: "power1.out"
                        }
                    ]
                }
            },
            {
                text: "why your feet hurt",
                color: 0xffffff,
                animation: {
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.3,
                            ease: "power1.out"
                        }
                    ]
                }
            },
            {
                text: "after a long day?",
                color: 0xffffff,
                animation: {
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.3,
                            ease: "power1.out"
                        }
                    ]
                }
            }
        ],
        fontUrl: FONT_URL_SHARED,
        baseFontSize: [1.7, 1.7, 1.7],
        gapSpec: { mode: "ratio", value: -0.15 },
        letterSpacingFactor: -0.2,
        wordSpacingFactor: 0.25,
        groupRotation: { x: 0, y: 0, z: 0 },
        lineZOffsets: [0, 0, 0], // Space out the three lines vertically
        defaultAnimation: {}
    },
    "s12_the_phrase": {
        idForMesh: "Scene12Text_from_library",
        lines: [
            {
                text: "the",
                color: 0x333333,
                textAlign: 'left',
                animation: {
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.3,
                            ease: "power1.out"
                        },
                        {
                            target: "position",
                            from: { y: -1 },
                            to: { y: 0 },
                            duration: 0.3,
                            ease: "power2.out"
                        }
                    ]
                }
            }
        ],
        fontUrl: FONT_URL_SHARED,
        baseFontSize: [4.0], // Larger size for single word
        gapSpec: { mode: "ratio", value: -0.2 },
        letterSpacingFactor: -0.15,
        wordSpacingFactor: 0.25,
        groupRotation: { x: 0, y: 0, z: 0 },
        lineZOffsets: [0],
        defaultAnimation: {}
    },
    "s13_lets_message_in_phrase": {
        idForMesh: "Scene13Text_from_library",
        lines: [
            {
                lineId: "s13_lets",
                text: "lets",
                color: 0x333333,
                textAlign: {
                    type: "relative",
                    targetLineId: "s13_message",
                    positionInSpaceRelativeToLine: "left",
                    specificAlignmentForThisText: "left"
                },
                animation: {
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.3,
                            ease: "power1.out"
                        },
                        {
                            target: "position",
                            from: { x: -1 },
                            to: { x: 0 },
                            duration: 0.3,
                            ease: "power2.out"
                        }
                    ]
                }
            },
            {
                lineId: "s13_message",
                text: "the message",
                color: 0x333333,
                textAlign: 'center',
                animation: {
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.3,
                            ease: "power1.out"
                        },
                        {
                            target: "position",
                            from: { x: -1 },
                            to: { x: 0 },
                            duration: 0.3,
                            ease: "power2.out"
                        }
                    ]
                }
            },
            {
                lineId: "s13_in",
                text: "in",
                color: 0x333333,
                textAlign: {
                    type: "relative",
                    targetLineId: "s13_message",
                    positionInSpaceRelativeToLine: "right",
                    specificAlignmentForThisText: "right"
                },
                animation: {
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.3,
                            ease: "power1.out"
                        },
                        {
                            target: "position",
                            from: { x: -1 },
                            to: { x: 0 },
                            duration: 0.3,
                            ease: "power2.out"
                        }
                    ]
                }
            }
        ],
        fontUrl: FONT_URL_SHARED,
        baseFontSize: [3.5, 5.5, 3.5],
        gapSpec: { mode: "ratio", value: -0.3 },
        letterSpacingFactor: -0.2,
        wordSpacingFactor: 0.25,
        groupRotation: { x: 0, y: 0, z: 0 },
        lineZOffsets: [0, 0, 0],
        defaultAnimation: {}
    },
    "s14_not_sales_pitch_phrase": {
        idForMesh: "Scene14Text_from_library",
        lines: [
            {
                lineId: "s14_because",
                text: "because",
                color: 0x333333,
                textAlign: {
                    type: "relative",
                    targetLineId: "s14_its_not",
                    positionInSpaceRelativeToLine: "left",
                    specificAlignmentForThisText: "left"
                },
                animation: {
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.3,
                            ease: "power1.out"
                        }
                    ]
                }
            },
            {
                lineId: "s14_its_not",
                text: "it's not",
                color: 0x333333,
                textAlign: "center",
                animation: {
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.3,
                            ease: "power1.out"
                        }
                    ]
                }
            },
            {
                lineId: "s14_sales_pitch",
                text: "a sales pitch",
                color: 0x333333,
                textAlign: "center",
                animation: {
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.3,
                            ease: "power1.out"
                        },
                        {
                            target: "position",
                            from: { x: -1 },
                            to: { x: 0 },
                            duration: 0.3,
                            ease: "power2.out"
                        }
                    ]
                }
            }
        ],
        fontUrl: FONT_URL_SHARED,
        baseFontSize: [3, 8.5, 5.5],
        widthTargets: [12, 24, 24],
        gapSpec: { mode: "ratio", value: -0.45 },
        letterSpacingFactor: -0.1,
        wordSpacingFactor: 0.25,
        groupRotation: { x: 0, y: 0, z: 0 },
        lineZOffsets: [0, 0, 0],
        defaultAnimation: {}
    },
    "s15_once_inside_phrase": {
        idForMesh: "Scene15Text_from_library",
        lines: [
            {
                lineId: "s15_once_inside",
                text: "once inside",
                color: 0xffffff,
                textAlign: "center",
                animation: {
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.3,
                            ease: "power1.out"
                        }
                    ]
                }
            }
        ],
        fontUrl: FONT_URL_SHARED,
        baseFontSize: 4.5,
        gapSpec: { mode: "ratio", value: -0.3 },
        letterSpacingFactor: -0.2,
        wordSpacingFactor: 0.25,
        groupRotation: { x: 0, y: 0, z: 0 },
        lineZOffsets: [0],
        defaultAnimation: {}
    },
    "s16_your_offer_unfold_phrase": {
        idForMesh: "Scene16Text_from_library",
        lines: [
            {
                lineId: "s16_your_offer",
                text: "your offer",
                color: 0xffffff,
                textAlign: {
                    type: "relative",
                    targetLineId: "s16_naturally",
                    positionInSpaceRelativeToLine: "left",
                    specificAlignmentForThisText: "left"
                },
                animation: {
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.3,
                            ease: "power1.out"
                        }
                    ]
                }
            },
            {
                lineId: "s16_unfold",
                text: "unfolds",
                color: 0xffffff,
                textAlign: {
                    type: "relative",
                    targetLineId: "s16_naturally",
                    positionInSpaceRelativeToLine: "right",
                    specificAlignmentForThisText: "right"
                },
                animation: {
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.3,
                            ease: "power1.out"
                        }
                    ]
                }
            },
            {
                lineId: "s16_naturally",
                text: "naturally",
                color: 0xffffff,
                textAlign: "center",
                animation: {
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.3,
                            ease: "power1.out"
                        }
                    ]
                }
            }
        ],
        fontUrl: FONT_URL_SHARED,
        baseFontSize: [3, 5, 5.5], // Font size 3.5 for all as requested
        widthTargets: [13.5, 15, 20], // Text width targets as requested
        gapSpec: { mode: "ratio", value: -0.4 },
        letterSpacingFactor: -0.1,
        wordSpacingFactor: 0.25,
        groupRotation: { x: 0, y: 0, z: 0 },
        lineZOffsets: [0, 0, 0],
        defaultAnimation: {
            granularity: "word",
            tweens: [
                {
                    target: "self",
                    from: { fillOpacity: 0 },
                    to: { fillOpacity: 1 },
                    duration: 0.3,
                    ease: "power1.out"
                }
            ]
        }
    },
    "s17_package_pitch_phrase": {
        idForMesh: "Scene17Text_from_library",
        lines: [
            {
                lineId: "s17_package",
                text: "package",
                color: 0xffffff,
                textAlign: {
                    type: "relative",
                    targetLineId: "s17_your_pitch",
                    positionInSpaceRelativeToLine: "left",
                    specificAlignmentForThisText: "left"
                },
                animation: {
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.3,
                            ease: "power1.out"
                        }
                    ]
                }
            },
            {
                lineId: "s17_your_pitch",
                text: "your pitch",
                color: 0xffffff,
                textAlign: "center",
                animation: {
                    granularity: "word", 
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.3,
                            ease: "power1.out"
                        },
                        {
                            target: "position",
                            from: { x: -1 },
                            to: { x: 0 },
                            duration: 0.3,
                            ease: "power2.out"
                        }
                    ]
                }
            }
        ],
        fontUrl: FONT_URL_SHARED,
        baseFontSize: [3, 6], // Font sizes as requested: 3 for "Package", 6 for "your pitch"
        widthTargets: [14, 20], // Width targets as requested
        gapSpec: { mode: "ratio", value: -0.3 },
        letterSpacingFactor: -0.1,
        wordSpacingFactor: 0.25,
        groupRotation: { x: 0, y: 0, z: 0 },
        lineZOffsets: [0, 0],
        defaultAnimation: {}
    },
    "s18_inside_value_phrase": {
        idForMesh: "Scene18Text_from_library",
        lines: [
            {
                text: "inside value",
                color: 0xffffff,
                textAlign: 'center',
                animation: {
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.3,
                            ease: "power1.out"
                        }
                    ]
                }
            }
        ],
        fontUrl: FONT_URL_SHARED,
        baseFontSize: 4.0,
        gapSpec: { mode: "ratio", value: -0.3 },
        letterSpacingFactor: -0.15,
        wordSpacingFactor: 0.25,
        groupRotation: { x: 0, y: 0, z: 0 },
        lineZOffsets: [0],
        defaultAnimation: {
            granularity: "word",
            tweens: [
                {
                    target: "self",
                    from: { fillOpacity: 0 },
                    to: { fillOpacity: 1 },
                    duration: 0.3,
                    ease: "power1.out"
                }
            ]
        }
    },
    "s19_and_theyll_phrase": {
        idForMesh: "Scene19Text_from_library",
        lines: [
            {
                text: "and they'll",
                color: 0xffffff,
                textAlign: 'center',
                animation: {
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.4,
                            ease: "power1.out"
                        }
                    ]
                }
            }
        ],
        fontUrl: FONT_URL_SHARED,
        baseFontSize: 4,
        gapSpec: { mode: "ratio", value: -0.3 },
        letterSpacingFactor: -0.15,
        wordSpacingFactor: 0.25,
        groupRotation: { x: 0, y: 0, z: 0 },
        lineZOffsets: [0],
        defaultAnimation: {}
    },
    "s20_welcome_it_phrase": {
        idForMesh: "Scene20Text_from_library",
        lines: [
            {
                text: "welcome it",
                color: 0xffffff,
                textAlign: 'center',
                animation: {
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.4,
                            ease: "power1.out"
                        }
                    ]
                }
            }
        ],
        fontUrl: FONT_URL_SHARED,
        baseFontSize: 4,
        gapSpec: { mode: "ratio", value: -0.3 },
        letterSpacingFactor: -0.15,
        wordSpacingFactor: 0.25,
        groupRotation: { x: 0, y: 0, z: 0 },
        lineZOffsets: [0],
        defaultAnimation: {}
    },
    "s21_in_phrase": {
        idForMesh: "Scene21Text_from_library",
        lines: [
            {
                text: "in",
                color: 0xffffff,
                textAlign: 'center',
                animation: {
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 0.4,
                            ease: "power1.out"
                        }
                    ]
                }
            }
        ],
        fontUrl: FONT_URL_SHARED,
        baseFontSize: 5.0, // Slightly larger for this short word
        gapSpec: { mode: "ratio", value: -0.3 },
        letterSpacingFactor: -0.15,
        wordSpacingFactor: 0.25,
        groupRotation: { x: 0, y: 0, z: 0 },
        lineZOffsets: [0],
        defaultAnimation: {}
    },
    "s22_marketing_psychology_phrase": {
        idForMesh: "Scene22MainText_from_library",
        lines: [
            {
                text: "Marketing Psychology Series",
                color: 0xffffff,
                textAlign: 'center',
                animation: {
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 1, // Updated fade-in duration
                            ease: "power1.out"
                        }
                    ]
                }
            }
        ],
        fontUrl: FONT_URL_SHARED,
        baseFontSize: 4,
        widthTargets: [25], // Width increased by 25% (20 * 1.25 = 25)
        gapSpec: { mode: "ratio", value: -0.3 },
        letterSpacingFactor: -0.15,
        wordSpacingFactor: 0.25,
        groupRotation: { x: 0, y: 0, z: 0 },
        lineZOffsets: [0],
        defaultAnimation: {}
    },
    "s22_collins_ecom_phrase": {
        idForMesh: "Scene22HandleText_from_library",
        lines: [
            {
                text: "@collins.ecom",
                color: 0xffffff,
                textAlign: 'center',
                animation: {
                    granularity: "word",
                    tweens: [
                        {
                            target: "self",
                            from: { fillOpacity: 0 },
                            to: { fillOpacity: 1 },
                            duration: 1, // Updated fade-in duration
                            ease: "power1.out"
                        }
                    ]
                }
            }
        ],
        fontUrl: FONT_URL_SHARED,
        baseFontSize: 2.5, // Smaller font for handle text
        widthTargets: [9], // Width increased by 25% (7 * 1.25 = 8.75, rounded to 9)
        gapSpec: { mode: "ratio", value: -0.3 },
        letterSpacingFactor: -0.15,
        wordSpacingFactor: 0.25,
        groupRotation: { x: 0, y: 0, z: 0 },
        lineZOffsets: [0],
        defaultAnimation: {}
    }
};