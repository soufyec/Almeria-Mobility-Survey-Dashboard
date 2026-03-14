import React, { useState, useMemo } from "react";
import GREVocabNotifications from "./GREVocabNotifications";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
} from "recharts";

const D = [
  {
    id: "R001",
    age: "18-24",
    occ: "young_prof",
    res: "roquetas",
    veh: "car_gas",
    intent: "unlikely",
    wtp: "2-3",
    exp: "varies",
    prox: "1-3km",
    problems: ["pollution", "pt_inefficient"],
    barriers: ["pt_coverage", "pt_schedule", "pt_slow"],
    factors: ["speed", "cost", "comfort", "flexibility", "sustainability"],
    reasons: ["work", "leisure", "sports"],
    features: [],
    matrix: {
      travel: "sporadic",
      commute: "daily",
      leisure: "daily",
      shopping: "weekly",
      family: "weekly",
    },
  },
  {
    id: "R002",
    age: "18-24",
    occ: "student_uni",
    res: "roquetas",
    veh: "car_gas",
    intent: "likely",
    wtp: "<2",
    exp: "stressful",
    prox: "1-3km",
    problems: ["pt_inefficient", "parking"],
    barriers: ["pt_coverage", "pt_schedule", "habit"],
    factors: ["flexibility", "cost", "comfort", "speed", "sustainability"],
    reasons: ["study"],
    features: ["autonomy", "availability", "ease"],
    matrix: {
      shopping: "weekly",
      family: "sporadic",
      leisure: "weekly",
      commute: "daily",
      travel: "sporadic",
    },
  },
  {
    id: "R003",
    age: "25-34",
    occ: "young_prof",
    res: "roquetas",
    veh: "car_gas",
    intent: "unlikely",
    wtp: "<2",
    exp: "varies",
    prox: "1-3km",
    problems: ["pt_inefficient", "connections"],
    barriers: ["pt_coverage"],
    factors: ["speed", "comfort", "flexibility", "cost", "sustainability"],
    reasons: ["sports"],
    features: [],
    matrix: {
      family: "sporadic",
      shopping: "sporadic",
      leisure: "weekly",
      travel: "sporadic",
      commute: "daily",
    },
  },
  {
    id: "R004",
    age: "25-34",
    occ: "young_prof",
    res: "roquetas",
    veh: "car_electric",
    intent: "likely",
    wtp: "<2",
    exp: "neutral",
    prox: "500m-1km",
    problems: ["pt_inefficient", "car_dependency"],
    barriers: ["pt_schedule", "pt_slow", "autonomy"],
    factors: ["speed", "flexibility", "comfort", "cost", "sustainability"],
    reasons: ["work"],
    features: ["autonomy", "price", "charging"],
    matrix: {
      travel: "sporadic",
      shopping: "sporadic",
      leisure: "weekly",
      family: "sporadic",
      commute: "daily",
    },
  },
  {
    id: "R005",
    age: "18-24",
    occ: "student_uni",
    res: "almeria",
    veh: "car_gas",
    intent: "possible",
    wtp: "4-5",
    exp: "neutral",
    prox: "500m-1km",
    problems: ["pt_inefficient", "connections"],
    barriers: ["pt_coverage", "pt_schedule", "pt_slow"],
    factors: ["speed", "comfort", "flexibility", "cost", "sustainability"],
    reasons: ["work", "study", "family", "sports"],
    features: ["availability", "price", "charging"],
    matrix: {
      leisure: "weekly",
      commute: "daily",
      shopping: "weekly",
      family: "sporadic",
      travel: "sporadic",
    },
  },
  {
    id: "R006",
    age: "18-24",
    occ: "student_hs",
    res: "roquetas",
    veh: "car_gas",
    intent: "unlikely",
    wtp: "2-3",
    exp: "pleasant",
    prox: ">10km",
    problems: ["pt_inefficient", "parking"],
    barriers: ["pt_coverage", "pt_schedule"],
    factors: ["comfort", "speed", "flexibility", "sustainability", "cost"],
    reasons: ["study"],
    features: [],
    matrix: {
      family: "sporadic",
      leisure: "daily",
      shopping: "sporadic",
      commute: "daily",
      travel: "sporadic",
    },
  },
  {
    id: "R007",
    age: "18-24",
    occ: "student_uni",
    res: "vicar",
    veh: "scooter",
    intent: "likely",
    wtp: "4-5",
    exp: "pleasant",
    prox: "500m-1km",
    problems: ["pt_inefficient", "parking"],
    barriers: [],
    factors: ["comfort", "speed", "cost", "flexibility", "sustainability"],
    reasons: ["study", "leisure"],
    features: ["no_license", "autonomy", "service"],
    matrix: {
      commute: "sporadic",
      leisure: "weekly",
      travel: "never",
      shopping: "sporadic",
      family: "never",
    },
  },
  {
    id: "R008",
    age: "18-24",
    occ: "student_hs",
    res: "roquetas",
    veh: "scooter",
    intent: "likely",
    wtp: "4-5",
    exp: "pleasant",
    prox: "500m-1km",
    problems: ["pt_inefficient", "parking"],
    barriers: [],
    factors: ["speed", "cost", "flexibility", "comfort", "sustainability"],
    reasons: ["study"],
    features: ["no_license", "autonomy", "service"],
    matrix: {
      shopping: "weekly",
      family: "sporadic",
      travel: "sporadic",
      leisure: "weekly",
      commute: "daily",
    },
  },
  {
    id: "R009",
    age: "18-24",
    occ: "young_prof",
    res: "roquetas",
    veh: "moto_gas",
    intent: "possible",
    wtp: "2-3",
    exp: "neutral",
    prox: "500m-1km",
    problems: ["pt_inefficient", "no_innovation"],
    barriers: [],
    factors: ["speed", "cost", "flexibility", "comfort", "sustainability"],
    reasons: ["leisure", "work", "other"],
    features: ["safety", "no_license", "service"],
    matrix: {
      shopping: "weekly",
      commute: "daily",
      leisure: "sporadic",
      family: "sporadic",
      travel: "sporadic",
    },
  },
  {
    id: "R010",
    age: "18-24",
    occ: "young_prof",
    res: "roquetas",
    veh: "car_gas",
    intent: "possible",
    wtp: "<2",
    exp: "neutral",
    prox: "1-3km",
    problems: ["traffic", "pt_inefficient"],
    barriers: ["pt_coverage", "pt_schedule", "autonomy"],
    factors: ["speed", "cost", "flexibility", "sustainability", "comfort"],
    reasons: ["work", "study", "leisure", "sports", "social"],
    features: ["ease", "price", "sustainability"],
    matrix: {
      leisure: "sporadic",
      commute: "daily",
      travel: "sporadic",
      shopping: "sporadic",
      family: "sporadic",
    },
  },
  {
    id: "R011",
    age: "18-24",
    occ: "young_prof",
    res: "roquetas",
    veh: "car_gas",
    intent: "very_likely",
    wtp: "<2",
    exp: "boring",
    prox: "0-500m",
    problems: ["pt_inefficient", "connections"],
    barriers: ["pt_coverage", "pt_schedule"],
    factors: ["speed", "flexibility", "comfort", "cost", "sustainability"],
    reasons: ["work"],
    features: ["service", "charging"],
    matrix: {
      family: "daily",
      travel: "daily",
      leisure: "daily",
      shopping: "daily",
      commute: "daily",
    },
  },
  {
    id: "R012",
    age: "18-24",
    occ: "student_uni",
    res: "roquetas",
    veh: "car_gas",
    intent: "possible",
    wtp: "2-3",
    exp: "neutral",
    prox: "500m-1km",
    problems: ["traffic", "parking"],
    barriers: ["pt_schedule", "autonomy", "habit"],
    factors: ["comfort", "flexibility", "speed", "cost", "sustainability"],
    reasons: ["study", "leisure", "sports"],
    features: ["availability", "price", "safety"],
    matrix: {
      commute: "daily",
      leisure: "daily",
      travel: "sporadic",
      shopping: "sporadic",
      family: "sporadic",
    },
  },
  {
    id: "R013",
    age: "25-34",
    occ: "young_prof",
    res: "roquetas",
    veh: "car_gas",
    intent: "very_unlikely",
    wtp: "<2",
    exp: "stressful",
    prox: "500m-1km",
    problems: ["traffic", "pt_inefficient"],
    barriers: ["pt_coverage", "pt_slow", "autonomy"],
    factors: ["speed", "comfort", "flexibility", "cost", "sustainability"],
    reasons: ["work"],
    features: [],
    matrix: {
      travel: "sporadic",
      leisure: "sporadic",
      commute: "daily",
      family: "sporadic",
      shopping: "sporadic",
    },
  },
  {
    id: "R014",
    age: "18-24",
    occ: "young_prof",
    res: "roquetas",
    veh: "car_gas",
    intent: "unlikely",
    wtp: "3-4",
    exp: "neutral",
    prox: "500m-1km",
    problems: ["pt_inefficient", "parking"],
    barriers: ["pt_coverage", "pt_schedule", "habit"],
    factors: ["speed", "comfort", "cost", "flexibility", "sustainability"],
    reasons: ["leisure", "social", "shopping"],
    features: [],
    matrix: {
      travel: "sporadic",
      leisure: "weekly",
      shopping: "weekly",
      family: "weekly",
      commute: "daily",
    },
  },
  {
    id: "R015",
    age: "18-24",
    occ: "adult_prof",
    res: "roquetas",
    veh: "car_gas",
    intent: "unlikely",
    wtp: "<2",
    exp: "varies",
    prox: "500m-1km",
    problems: ["connections", "pt_inefficient"],
    barriers: ["pt_schedule", "autonomy", "pt_coverage"],
    factors: ["speed", "flexibility", "comfort", "cost", "sustainability"],
    reasons: ["leisure", "work", "medical"],
    features: [],
    matrix: {
      shopping: "daily",
      travel: "daily",
      family: "daily",
      commute: "daily",
      leisure: "daily",
    },
  },
  {
    id: "R016",
    age: "18-24",
    occ: "student_uni",
    res: "roquetas",
    veh: "car_gas",
    intent: "likely",
    wtp: "<2",
    exp: "neutral",
    prox: "500m-1km",
    problems: ["parking", "car_dependency"],
    barriers: ["pt_coverage", "pt_schedule", "no_bike_lanes"],
    factors: ["flexibility", "cost", "speed", "sustainability", "comfort"],
    reasons: ["study", "leisure", "sports", "social"],
    features: ["price", "availability", "charging"],
    matrix: {
      commute: "weekly",
      family: "sporadic",
      travel: "sporadic",
      leisure: "weekly",
      shopping: "sporadic",
    },
  },
  {
    id: "R017",
    age: "18-24",
    occ: "student_uni",
    res: "roquetas",
    veh: "car_gas",
    intent: "likely",
    wtp: "2-3",
    exp: "varies",
    prox: "500m-1km",
    problems: ["traffic", "pt_inefficient"],
    barriers: ["pt_coverage", "pt_schedule", "autonomy"],
    factors: ["speed", "comfort", "flexibility", "sustainability", "cost"],
    reasons: ["study", "work", "leisure", "shopping"],
    features: ["price", "autonomy", "availability"],
    matrix: {
      family: "weekly",
      leisure: "sporadic",
      commute: "weekly",
      shopping: "sporadic",
      travel: "sporadic",
    },
  },
  {
    id: "R018",
    age: "18-24",
    occ: "young_prof",
    res: "roquetas",
    veh: "car_gas",
    intent: "possible",
    wtp: "2-3",
    exp: "stressful",
    prox: "0-500m",
    problems: ["car_dependency", "traffic"],
    barriers: ["autonomy", "pt_slow", "pt_coverage"],
    factors: ["speed", "flexibility", "cost", "comfort", "sustainability"],
    reasons: ["work", "family", "shopping", "leisure"],
    features: ["availability", "price", "charging"],
    matrix: {
      shopping: "weekly",
      travel: "sporadic",
      leisure: "sporadic",
      commute: "weekly",
      family: "sporadic",
    },
  },
  {
    id: "R019",
    age: "18-24",
    occ: "student_uni",
    res: "roquetas",
    veh: "car_gas",
    intent: "unlikely",
    wtp: "2-3",
    exp: "stressful",
    prox: "500m-1km",
    problems: ["parking", "traffic"],
    barriers: ["habit"],
    factors: ["comfort", "flexibility", "speed", "cost", "sustainability"],
    reasons: ["work", "family", "shopping", "leisure"],
    features: [],
    matrix: {
      shopping: "sporadic",
      travel: "sporadic",
      leisure: "sporadic",
      commute: "sporadic",
      family: "weekly",
    },
  },
  {
    id: "R020",
    age: "25-34",
    occ: "young_prof",
    res: "roquetas",
    veh: "car_gas",
    intent: "likely",
    wtp: "<2",
    exp: "boring",
    prox: "1-3km",
    problems: ["pt_inefficient", "no_innovation"],
    barriers: ["pt_coverage", "pt_schedule", "autonomy"],
    factors: ["speed", "comfort", "flexibility", "cost", "sustainability"],
    reasons: ["shopping", "leisure", "sports"],
    features: ["ease", "availability", "price"],
    matrix: {
      family: "daily",
      shopping: "weekly",
      travel: "sporadic",
      commute: "sporadic",
      leisure: "daily",
    },
  },
  {
    id: "R021",
    age: "65+",
    occ: "adult_prof",
    res: "other",
    veh: "bike",
    intent: "likely",
    wtp: "2-3",
    exp: "neutral",
    prox: "1-3km",
    problems: ["pt_inefficient", "connections"],
    barriers: [],
    factors: ["cost", "speed", "flexibility", "sustainability", "comfort"],
    reasons: ["study", "sports", "social"],
    features: ["availability", "autonomy", "ease"],
    matrix: { leisure: "weekly", shopping: "weekly", commute: "weekly" },
  },
  {
    id: "R022",
    age: "18-24",
    occ: "adult_prof",
    res: "vicar",
    veh: "none",
    intent: "possible",
    wtp: ">5",
    exp: "neutral",
    prox: "1-3km",
    problems: ["traffic", "pollution"],
    barriers: [],
    factors: ["speed", "comfort", "flexibility", "cost", "sustainability"],
    reasons: ["work", "family", "shopping", "leisure", "social", "medical"],
    features: ["availability", "safety", "service"],
    matrix: {},
  },
  {
    id: "R023",
    age: "65+",
    occ: "other",
    res: "other",
    veh: "none",
    intent: "very_unlikely",
    wtp: "none",
    exp: "varies",
    prox: ">10km",
    problems: ["climate", "no_innovation"],
    barriers: [],
    factors: ["sustainability", "flexibility", "comfort", "cost", "speed"],
    reasons: ["medical"],
    features: [],
    matrix: {},
  },
  {
    id: "R024",
    age: "18-24",
    occ: "student_uni",
    res: "roquetas",
    veh: "car_gas",
    intent: "possible",
    wtp: "<2",
    exp: "varies",
    prox: "1-3km",
    problems: ["pt_inefficient", "connections"],
    barriers: ["pt_coverage", "pt_schedule", "pt_slow"],
    factors: ["flexibility", "speed", "cost", "comfort", "sustainability"],
    reasons: ["work"],
    features: ["service", "autonomy", "price"],
    matrix: {
      travel: "never",
      commute: "daily",
      leisure: "weekly",
      family: "weekly",
      shopping: "daily",
    },
  },
  {
    id: "R025",
    age: "65+",
    occ: "unemployed",
    res: "other",
    veh: "none",
    intent: "likely",
    wtp: "2-3",
    exp: "neutral",
    prox: "1-3km",
    problems: ["pt_inefficient", "car_dependency"],
    barriers: [],
    factors: ["sustainability", "comfort", "flexibility", "cost", "speed"],
    reasons: ["other"],
    features: ["availability", "price", "ease"],
    matrix: {},
  },
  {
    id: "R026",
    age: "65+",
    occ: "student_hs",
    res: "other",
    veh: "car_gas",
    intent: "likely",
    wtp: "2-3",
    exp: "neutral",
    prox: "1-3km",
    problems: ["pt_inefficient", "connections"],
    barriers: ["pt_schedule", "pt_coverage", "pt_slow"],
    factors: ["cost", "flexibility", "speed", "sustainability", "comfort"],
    reasons: ["shopping", "leisure"],
    features: ["availability", "autonomy", "price"],
    matrix: {
      travel: "never",
      commute: "sporadic",
      family: "sporadic",
      leisure: "weekly",
    },
  },
  {
    id: "R027",
    age: "18-24",
    occ: "self_employed",
    res: "roquetas",
    veh: "car_gas",
    intent: "possible",
    wtp: "4-5",
    exp: "neutral",
    prox: "1-3km",
    problems: ["pt_inefficient", "car_dependency"],
    barriers: ["pt_coverage", "pt_schedule", "autonomy"],
    factors: ["speed", "flexibility", "comfort", "sustainability", "cost"],
    reasons: ["leisure"],
    features: ["availability", "ease", "price"],
    matrix: {
      travel: "weekly",
      commute: "sporadic",
      family: "weekly",
      shopping: "weekly",
      leisure: "weekly",
    },
  },
  {
    id: "R028",
    age: "18-24",
    occ: "student_uni",
    res: "roquetas",
    veh: "car_gas",
    intent: "possible",
    wtp: "3-4",
    exp: "uncomfortable",
    prox: "500m-1km",
    problems: ["pt_inefficient", "parking"],
    barriers: ["pt_coverage", "pt_schedule", "pt_slow"],
    factors: ["comfort", "cost", "speed", "flexibility", "sustainability"],
    reasons: ["leisure", "study"],
    features: ["availability", "ease", "price"],
    matrix: {
      leisure: "weekly",
      travel: "sporadic",
      shopping: "sporadic",
      family: "sporadic",
      commute: "never",
    },
  },
  {
    id: "R029",
    age: "18-24",
    occ: "student_hs",
    res: "roquetas",
    veh: "none",
    intent: "very_likely",
    wtp: "2-3",
    exp: "stressful",
    prox: "1-3km",
    problems: ["connections", "bike_infra"],
    barriers: [],
    factors: ["cost", "speed", "flexibility", "comfort", "sustainability"],
    reasons: ["sports", "leisure", "shopping", "family", "work", "study"],
    features: ["service"],
    matrix: {},
  },
  {
    id: "R030",
    age: "18-24",
    occ: "young_prof",
    res: "roquetas",
    veh: "car_gas",
    intent: "possible",
    wtp: "<2",
    exp: "pleasant",
    prox: "1-3km",
    problems: ["traffic", "pollution"],
    barriers: ["pt_schedule", "pt_slow", "pt_coverage"],
    factors: ["cost", "sustainability", "speed", "comfort", "flexibility"],
    reasons: ["leisure"],
    features: ["price", "autonomy", "safety"],
    matrix: { commute: "daily" },
  },
  {
    id: "R031",
    age: "25-34",
    occ: "young_prof",
    res: "roquetas",
    veh: "car_gas",
    intent: "possible",
    wtp: "<2",
    exp: "neutral",
    prox: "3-5km",
    problems: ["parking", "pollution"],
    barriers: ["pt_coverage", "passengers", "pt_schedule"],
    factors: ["speed", "comfort", "flexibility", "cost", "sustainability"],
    reasons: ["work", "shopping", "leisure", "sports"],
    features: ["price", "availability", "ease"],
    matrix: {
      shopping: "weekly",
      travel: "sporadic",
      commute: "daily",
      leisure: "sporadic",
      family: "never",
    },
  },
  {
    id: "R032",
    age: "18-24",
    occ: "student_uni",
    res: "roquetas",
    veh: "car_gas",
    intent: "possible",
    wtp: "<2",
    exp: "stressful",
    prox: "500m-1km",
    problems: ["pt_inefficient", "traffic"],
    barriers: ["pt_schedule", "pt_slow", "pt_coverage"],
    factors: ["speed", "flexibility", "comfort", "cost", "sustainability"],
    reasons: ["study", "leisure", "sports", "medical"],
    features: ["availability", "autonomy", "no_license"],
    matrix: {
      commute: "daily",
      family: "weekly",
      leisure: "sporadic",
      travel: "sporadic",
      shopping: "sporadic",
    },
  },
  {
    id: "R033",
    age: "18-24",
    occ: "other",
    res: "roquetas",
    veh: "none",
    intent: "very_likely",
    wtp: "3-4",
    exp: "varies",
    prox: "0-500m",
    problems: ["pt_inefficient", "car_dependency"],
    barriers: [],
    factors: ["cost", "flexibility", "speed", "sustainability", "comfort"],
    reasons: ["work", "shopping", "leisure", "medical"],
    features: ["price", "availability", "no_license"],
    matrix: {},
  },
  {
    id: "R034",
    age: "18-24",
    occ: "student_uni",
    res: "other",
    veh: "car_electric",
    intent: "possible",
    wtp: "<2",
    exp: "stressful",
    prox: "500m-1km",
    problems: ["pt_inefficient", "bike_infra"],
    barriers: ["pt_slow", "pt_schedule", "heavy_items"],
    factors: ["flexibility", "speed", "cost", "comfort", "sustainability"],
    reasons: [
      "study",
      "work",
      "family",
      "shopping",
      "leisure",
      "sports",
      "medical",
    ],
    features: ["service", "availability", "price"],
    matrix: {
      commute: "daily",
      family: "sporadic",
      travel: "sporadic",
      shopping: "sporadic",
      leisure: "weekly",
    },
  },
  {
    id: "R035",
    age: "18-24",
    occ: "other",
    res: "roquetas",
    veh: "car_gas",
    intent: "likely",
    wtp: "2-3",
    exp: "neutral",
    prox: "1-3km",
    problems: ["pt_inefficient", "car_dependency"],
    barriers: ["pt_coverage", "pt_schedule", "autonomy"],
    factors: ["flexibility", "cost", "comfort", "sustainability", "speed"],
    reasons: ["study", "shopping", "leisure", "sports", "social"],
    features: ["ease", "availability", "price"],
    matrix: {
      family: "weekly",
      shopping: "weekly",
      leisure: "weekly",
      commute: "sporadic",
      travel: "sporadic",
    },
  },
  {
    id: "R036",
    age: "18-24",
    occ: "young_prof",
    res: "roquetas",
    veh: "car_gas",
    intent: "very_likely",
    wtp: "<2",
    exp: "stressful",
    prox: "1-3km",
    problems: ["traffic", "pt_inefficient"],
    barriers: ["pt_schedule", "pt_coverage"],
    factors: ["flexibility", "speed", "cost", "comfort", "sustainability"],
    reasons: ["leisure"],
    features: ["availability", "safety", "price"],
    matrix: {
      leisure: "weekly",
      family: "sporadic",
      shopping: "sporadic",
      travel: "sporadic",
      commute: "daily",
    },
  },
  {
    id: "R037",
    age: "18-24",
    occ: "student_hs",
    res: "roquetas",
    veh: "bike",
    intent: "possible",
    wtp: "2-3",
    exp: "uncomfortable",
    prox: "500m-1km",
    problems: ["car_dependency", "climate"],
    barriers: [],
    factors: ["comfort", "speed", "cost", "flexibility", "sustainability"],
    reasons: ["sports"],
    features: ["autonomy", "no_license", "safety"],
    matrix: {
      shopping: "never",
      family: "weekly",
      commute: "weekly",
      travel: "weekly",
      leisure: "weekly",
    },
  },
  {
    id: "R038",
    age: "18-24",
    occ: "student_uni",
    res: "roquetas",
    veh: "car_gas",
    intent: "likely",
    wtp: "2-3",
    exp: "neutral",
    prox: "500m-1km",
    problems: ["traffic", "pt_inefficient"],
    barriers: ["pt_coverage", "habit", "autonomy"],
    factors: ["speed", "comfort", "flexibility", "cost", "sustainability"],
    reasons: ["study", "leisure"],
    features: ["availability", "price", "helmets"],
    matrix: {
      leisure: "daily",
      travel: "sporadic",
      commute: "daily",
      shopping: "sporadic",
      family: "sporadic",
    },
  },
  {
    id: "R039",
    age: "18-24",
    occ: "student_uni",
    res: "nijar",
    veh: "car_gas",
    intent: "likely",
    wtp: "<2",
    exp: "neutral",
    prox: "1-3km",
    problems: ["traffic", "pt_inefficient"],
    barriers: ["no_bike_lanes", "climate", "heavy_items"],
    factors: ["cost", "speed", "comfort", "flexibility", "sustainability"],
    reasons: ["study"],
    features: ["ease"],
    matrix: {
      travel: "daily",
      leisure: "weekly",
      shopping: "weekly",
      family: "weekly",
      commute: "sporadic",
    },
  },
  {
    id: "R040",
    age: "65+",
    occ: "other",
    res: "other",
    veh: "car_gas",
    intent: "likely",
    wtp: "2-3",
    exp: "neutral",
    prox: "1-3km",
    problems: ["pt_inefficient", "connections"],
    barriers: ["pt_schedule", "pt_slow", "no_bike_lanes"],
    factors: ["cost", "comfort", "flexibility", "sustainability", "speed"],
    reasons: ["work", "family", "leisure", "sports"],
    features: ["availability", "no_license", "ease"],
    matrix: { travel: "never" },
  },
  {
    id: "R041",
    age: "18-24",
    occ: "student_hs",
    res: "roquetas",
    veh: "none",
    intent: "very_likely",
    wtp: "2-3",
    exp: "boring",
    prox: "500m-1km",
    problems: ["pt_inefficient", "bike_infra"],
    barriers: [],
    factors: ["cost", "sustainability", "flexibility", "speed", "comfort"],
    reasons: [
      "study",
      "shopping",
      "leisure",
      "sports",
      "social",
      "medical",
      "family",
    ],
    features: ["ease", "price", "availability"],
    matrix: {},
  },
  {
    id: "R042",
    age: "18-24",
    occ: "young_prof",
    res: "other",
    veh: "car_electric",
    intent: "very_likely",
    wtp: "<2",
    exp: "varies",
    prox: "500m-1km",
    problems: ["pt_inefficient", "car_dependency"],
    barriers: ["pt_coverage", "passengers", "autonomy"],
    factors: ["sustainability", "flexibility", "comfort", "cost", "speed"],
    reasons: ["sports", "leisure", "shopping", "family"],
    features: ["availability", "price", "charging"],
    matrix: {
      travel: "sporadic",
      family: "weekly",
      shopping: "weekly",
      leisure: "weekly",
    },
  },
  {
    id: "R043",
    age: "18-24",
    occ: "self_employed",
    res: "roquetas",
    veh: "car_gas",
    intent: "unlikely",
    wtp: "2-3",
    exp: "pleasant",
    prox: "0-500m",
    problems: ["pt_inefficient", "connections"],
    barriers: ["autonomy", "habit"],
    factors: ["comfort", "speed", "flexibility", "cost", "sustainability"],
    reasons: ["leisure", "sports", "social"],
    features: [],
    matrix: {
      leisure: "daily",
      travel: "sporadic",
      commute: "sporadic",
      family: "never",
      shopping: "daily",
    },
  },
  {
    id: "R044",
    age: "18-24",
    occ: "young_prof",
    res: "roquetas",
    veh: "car_gas",
    intent: "unlikely",
    wtp: "<2",
    exp: "neutral",
    prox: "0-500m",
    problems: ["pt_inefficient", "parking"],
    barriers: ["pt_coverage", "pt_schedule", "autonomy"],
    factors: ["speed", "flexibility", "cost", "comfort", "sustainability"],
    reasons: ["work", "shopping", "leisure", "sports"],
    features: [],
    matrix: {
      travel: "sporadic",
      commute: "daily",
      family: "sporadic",
      leisure: "sporadic",
      shopping: "weekly",
    },
  },
  {
    id: "R045",
    age: "18-24",
    occ: "student_uni",
    res: "roquetas",
    veh: "ebike",
    intent: "likely",
    wtp: "2-3",
    exp: "neutral",
    prox: "500m-1km",
    problems: ["traffic", "no_innovation"],
    barriers: [],
    factors: ["speed", "cost", "flexibility", "sustainability", "comfort"],
    reasons: ["shopping", "leisure", "sports", "social", "study"],
    features: ["availability", "ease", "no_license"],
    matrix: {
      shopping: "sporadic",
      commute: "weekly",
      leisure: "weekly",
      family: "sporadic",
      travel: "sporadic",
    },
  },
  {
    id: "R046",
    age: "18-24",
    occ: "unemployed",
    res: "other",
    veh: "none",
    intent: "possible",
    wtp: "3-4",
    exp: "varies",
    prox: "1-3km",
    problems: ["pt_inefficient", "traffic"],
    barriers: [],
    factors: ["speed", "cost", "flexibility", "comfort", "sustainability"],
    reasons: ["work"],
    features: ["price", "autonomy", "service"],
    matrix: {},
  },
  {
    id: "R047",
    age: "18-24",
    occ: "student_uni",
    res: "almeria",
    veh: "car_electric",
    intent: "very_likely",
    wtp: "<2",
    exp: "neutral",
    prox: "1-3km",
    problems: ["traffic", "pt_inefficient"],
    barriers: ["pt_coverage", "pt_schedule", "autonomy"],
    factors: ["speed", "flexibility", "comfort", "cost", "sustainability"],
    reasons: ["study", "work", "leisure"],
    features: ["charging", "service", "sustainability"],
    matrix: {
      family: "never",
      commute: "weekly",
      shopping: "sporadic",
      travel: "sporadic",
      leisure: "sporadic",
    },
  },
  {
    id: "R048",
    age: "18-24",
    occ: "unemployed",
    res: "other",
    veh: "none",
    intent: "very_likely",
    wtp: "4-5",
    exp: "boring",
    prox: "1-3km",
    problems: ["connections", "car_dependency"],
    barriers: [],
    factors: ["flexibility", "sustainability", "speed", "comfort", "cost"],
    reasons: [
      "work",
      "shopping",
      "study",
      "sports",
      "leisure",
      "medical",
      "family",
    ],
    features: ["no_license", "availability", "autonomy"],
    matrix: {},
  },
  {
    id: "R049",
    age: "35-44",
    occ: "adult_prof",
    res: "roquetas",
    veh: "car_gas",
    intent: "unlikely",
    wtp: "none",
    exp: "stressful",
    prox: "500m-1km",
    problems: ["pt_inefficient", "parking"],
    barriers: ["pt_coverage", "pt_schedule", "pt_slow"],
    factors: ["flexibility", "speed", "cost", "comfort", "sustainability"],
    reasons: ["work", "shopping", "leisure", "medical"],
    features: [],
    matrix: {
      travel: "sporadic",
      commute: "daily",
      shopping: "weekly",
      family: "sporadic",
      leisure: "sporadic",
    },
  },
  {
    id: "R050",
    age: "18-24",
    occ: "young_prof",
    res: "roquetas",
    veh: "car_electric",
    intent: "possible",
    wtp: "<2",
    exp: "neutral",
    prox: "1-3km",
    problems: ["no_innovation", "bike_infra"],
    barriers: ["pt_schedule"],
    factors: ["speed", "flexibility", "comfort", "cost", "sustainability"],
    reasons: ["work", "leisure"],
    features: ["sustainability", "service", "helmets"],
    matrix: {
      travel: "sporadic",
      family: "sporadic",
      shopping: "sporadic",
      commute: "daily",
      leisure: "sporadic",
    },
  },
  {
    id: "R051",
    age: "18-24",
    occ: "young_prof",
    res: "roquetas",
    veh: "car_gas",
    intent: "possible",
    wtp: "4-5",
    exp: "neutral",
    prox: "500m-1km",
    problems: ["pt_inefficient", "parking"],
    barriers: ["pt_coverage", "pt_schedule", "climate"],
    factors: ["speed", "comfort", "cost", "flexibility", "sustainability"],
    reasons: ["work", "shopping", "leisure", "sports"],
    features: ["price", "availability", "charging"],
    matrix: {
      travel: "sporadic",
      leisure: "daily",
      shopping: "weekly",
      commute: "daily",
      family: "never",
    },
  },
  {
    id: "R052",
    age: "45-54",
    occ: "young_prof",
    res: "roquetas",
    veh: "car_gas",
    intent: "likely",
    wtp: "<2",
    exp: "varies",
    prox: "500m-1km",
    problems: ["parking", "pt_inefficient"],
    barriers: ["pt_coverage", "pt_schedule"],
    factors: ["cost", "comfort", "speed", "sustainability", "flexibility"],
    reasons: ["work"],
    features: ["price"],
    matrix: {
      travel: "sporadic",
      leisure: "weekly",
      shopping: "weekly",
      family: "sporadic",
      commute: "weekly",
    },
  },
  {
    id: "R053",
    age: "18-24",
    occ: "student_uni",
    res: "roquetas",
    veh: "car_gas",
    intent: "unlikely",
    wtp: "<2",
    exp: "neutral",
    prox: "500m-1km",
    problems: ["traffic", "pt_inefficient"],
    barriers: ["pt_coverage", "autonomy", "pt_slow"],
    factors: ["comfort", "flexibility", "speed", "cost", "sustainability"],
    reasons: ["study", "leisure", "sports", "social", "shopping", "medical"],
    features: [],
    matrix: {
      family: "sporadic",
      shopping: "sporadic",
      travel: "sporadic",
      commute: "daily",
      leisure: "daily",
    },
  },
  {
    id: "R054",
    age: "65+",
    occ: "other",
    res: "other",
    veh: "car_gas",
    intent: "likely",
    wtp: "2-3",
    exp: "neutral",
    prox: "1-3km",
    problems: ["pt_inefficient", "parking"],
    barriers: ["pt_schedule", "pt_slow", "pt_coverage"],
    factors: ["cost", "flexibility", "speed", "sustainability", "comfort"],
    reasons: ["medical", "social", "sports"],
    features: ["availability", "autonomy", "charging"],
    matrix: { leisure: "sporadic", shopping: "weekly" },
  },
  {
    id: "R055",
    age: "18-24",
    occ: "young_prof",
    res: "roquetas",
    veh: "car_gas",
    intent: "unlikely",
    wtp: "4-5",
    exp: "pleasant",
    prox: ">10km",
    problems: ["traffic", "pt_inefficient"],
    barriers: ["pt_schedule"],
    factors: ["speed", "comfort", "flexibility", "cost", "sustainability"],
    reasons: ["work"],
    features: [],
    matrix: {
      shopping: "daily",
      commute: "daily",
      travel: "never",
      family: "weekly",
      leisure: "daily",
    },
  },
  {
    id: "R056",
    age: "18-24",
    occ: "young_prof",
    res: "roquetas",
    veh: "bike",
    intent: "possible",
    wtp: "<2",
    exp: "neutral",
    prox: "500m-1km",
    problems: ["pt_inefficient", "car_dependency"],
    barriers: [],
    factors: ["cost", "sustainability", "comfort", "flexibility", "speed"],
    reasons: ["work", "family", "leisure", "shopping"],
    features: ["availability", "ease", "service"],
    matrix: {
      shopping: "weekly",
      family: "weekly",
      leisure: "daily",
      travel: "sporadic",
      commute: "daily",
    },
  },
  {
    id: "R057",
    age: "18-24",
    occ: "student_uni",
    res: "almeria",
    veh: "car_gas",
    intent: "very_likely",
    wtp: "<2",
    exp: "neutral",
    prox: "1-3km",
    problems: ["parking", "car_dependency"],
    barriers: ["pt_schedule"],
    factors: ["flexibility", "speed", "sustainability", "cost", "comfort"],
    reasons: ["study"],
    features: ["autonomy", "helmets", "safety"],
    matrix: { commute: "sporadic" },
  },
];

const L = {
  age: {
    "18-24": "18–24",
    "25-34": "25–34",
    "35-44": "35–44",
    "45-54": "45–54",
    "65+": "65+",
  },
  occ: {
    student_uni: "Uni Student",
    student_hs: "Secondary/FP",
    young_prof: "Young Prof.",
    adult_prof: "Adult Prof.",
    self_employed: "Self-Empl.",
    unemployed: "Unemployed",
    other: "Other",
  },
  res: {
    roquetas: "Roquetas",
    almeria: "Almería",
    vicar: "Vícar",
    nijar: "Níjar",
    other: "Other",
  },
  veh: {
    car_gas: "Car (Petrol)",
    car_electric: "Car (Electric)",
    none: "No Vehicle",
    bike: "Bicycle",
    scooter: "E-Scooter",
    moto_gas: "Motorcycle",
    ebike: "E-Bike",
  },
  intent: {
    very_likely: "Very Likely",
    likely: "Likely",
    possible: "Possible",
    unlikely: "Unlikely",
    very_unlikely: "Very Unlikely",
  },
  wtp: {
    "<2": "< €2",
    "2-3": "€2–3",
    "3-4": "€3–4",
    "4-5": "€4–5",
    ">5": "> €5",
    none: "Unwilling",
  },
  exp: {
    neutral: "Neutral",
    stressful: "Stressful",
    varies: "Variable",
    pleasant: "Pleasant",
    boring: "Boring",
    uncomfortable: "Uncomfortable",
  },
  problems: {
    pt_inefficient: "Inefficient PT",
    traffic: "Traffic",
    parking: "Parking",
    car_dependency: "Car Dependency",
    connections: "Poor Connections",
    no_innovation: "No Innovation",
    pollution: "Pollution",
    bike_infra: "Cycling Infra.",
    climate: "Climate",
    other: "Other",
  },
  barriers: {
    pt_schedule: "PT Schedules",
    pt_coverage: "PT Coverage",
    autonomy: "Need Autonomy",
    pt_slow: "PT Too Slow",
    habit: "Habit",
    no_bike_lanes: "No Bike Lanes",
    passengers: "Passengers",
    heavy_items: "Heavy Items",
    climate: "Climate",
  },
  factors: {
    speed: "Speed",
    cost: "Cost",
    comfort: "Comfort",
    flexibility: "Flexibility",
    sustainability: "Sustainability",
  },
  features: {
    availability: "Availability",
    price: "Price",
    autonomy: "Coverage",
    ease: "App Ease",
    service: "Vehicle Safety",
    charging: "Charging",
    no_license: "No License",
    safety: "Road Safety",
    sustainability: "Eco-Friendly",
    helmets: "Helmets",
  },
  reasons: {
    leisure: "Leisure",
    work: "Work",
    sports: "Sports",
    study: "Study",
    shopping: "Shopping",
    family: "Family",
    social: "Social",
    medical: "Medical",
    other: "Other",
  },
};
const IC = {
  very_likely: "#047857",
  likely: "#10b981",
  possible: "#eab308",
  unlikely: "#ef4444",
  very_unlikely: "#991b1b",
};
const P = [
  "#0c2d48",
  "#145374",
  "#2e86ab",
  "#5da9c6",
  "#a3d5e0",
  "#7b2d8e",
  "#27ae60",
  "#e67e22",
  "#e74c3c",
  "#1abc9c",
  "#f1c40f",
  "#8e44ad",
];
const sv = (v) => (Array.isArray(v) ? v[0] : v);
const cnt = (d, f) => {
  const c = {};
  d.forEach((r) => {
    const v = sv(r[f]);
    if (v) c[v] = (c[v] || 0) + 1;
  });
  return Object.entries(c)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => ({
      name: (L[f] || {})[k] || k,
      value: v,
      pct: +((v / d.length) * 100).toFixed(1),
      key: k,
    }));
};
const cntM = (d, f) => {
  const c = {};
  d.forEach((r) => {
    const a = r[f];
    if (Array.isArray(a))
      a.forEach((x) => {
        c[x] = (c[x] || 0) + 1;
      });
  });
  return Object.entries(c)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => ({
      name: (L[f] || L.problems || {})[k] || k,
      value: v,
      pct: +((v / d.length) * 100).toFixed(1),
      key: k,
    }));
};

const Chip = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: "4px 12px",
      fontSize: 11,
      borderRadius: 16,
      border: active ? "1.5px solid #145374" : "1px solid #d1d5db",
      background: active ? "#145374" : "#fff",
      color: active ? "#fff" : "#6b7280",
      cursor: "pointer",
      fontFamily: "inherit",
      fontWeight: active ? 600 : 400,
      transition: "all .15s",
    }}
  >
    {label}
  </button>
);

const Filters = ({
  fAge,
  setFAge,
  fOcc,
  setFOcc,
  fVeh,
  setFVeh,
  fRes,
  setFRes,
  n,
  reset,
  hasF,
}) => (
  <div
    style={{
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: "14px 18px",
      marginBottom: 16,
      boxShadow: "0 1px 2px rgba(0,0,0,.03)",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#0c2d48",
          letterSpacing: 0.5,
        }}
      >
        ⊳ FILTERS{" "}
        {hasF && (
          <span style={{ fontWeight: 400, color: "#6b7280" }}>
            — {n} of 57 respondents
          </span>
        )}
      </span>
      {hasF && (
        <button
          onClick={reset}
          style={{
            fontSize: 11,
            color: "#ef4444",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Reset ✕
        </button>
      )}
    </div>
    {[
      [
        "Age",
        ["18-24", "25-34", "35-44", "45-54", "65+"],
        fAge,
        setFAge,
        L.age,
      ],
      [
        "Segment",
        [
          "student_uni",
          "student_hs",
          "young_prof",
          "adult_prof",
          "unemployed",
          "self_employed",
          "other",
        ],
        fOcc,
        setFOcc,
        L.occ,
      ],
      [
        "Vehicle",
        ["has_car", "no_vehicle", "bike", "scooter", "moto_gas", "ebike"],
        fVeh,
        setFVeh,
        { has_car: "Car Owner", no_vehicle: "No Vehicle", ...L.veh },
      ],
      [
        "Location",
        ["roquetas", "almeria", "vicar", "nijar", "other"],
        fRes,
        setFRes,
        L.res,
      ],
    ].map(([label, opts, val, set, lm]) => (
      <div
        key={label}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexWrap: "wrap",
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: "#9ca3af",
            fontWeight: 600,
            width: 60,
            textAlign: "right",
          }}
        >
          {label}
        </span>
        <Chip label="All" active={val === "all"} onClick={() => set("all")} />
        {opts.map((o) => (
          <Chip
            key={o}
            label={(lm || {})[o] || o}
            active={val === o}
            onClick={() => set(o)}
          />
        ))}
      </div>
    ))}
  </div>
);

const S = ({ v, l, c = "#145374" }) => (
  <div
    style={{
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 10,
      padding: "16px 12px",
      textAlign: "center",
      borderTop: `3px solid ${c}`,
    }}
  >
    <div style={{ fontSize: 28, fontWeight: 800, color: "#0c2d48" }}>{v}</div>
    <div
      style={{
        fontSize: 10,
        color: "#9ca3af",
        marginTop: 3,
        letterSpacing: 0.8,
        textTransform: "uppercase",
      }}
    >
      {l}
    </div>
  </div>
);
const C = ({ title, note, children }) => (
  <div
    style={{
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: "18px 22px",
      marginBottom: 16,
      boxShadow: "0 1px 3px rgba(0,0,0,.04)",
    }}
  >
    {title && (
      <h3
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#0c2d48",
          margin: "0 0 2px",
        }}
      >
        {title}
      </h3>
    )}
    {note && (
      <p
        style={{
          fontSize: 10.5,
          color: "#9ca3af",
          margin: "0 0 12px",
          fontStyle: "italic",
        }}
      >
        {note}
      </p>
    )}
    {children}
  </div>
);
const HB = ({ data, color = "#145374" }) => {
  const mx = Math.max(...data.map((d) => d.pct), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 130,
              fontSize: 11.5,
              color: "#374151",
              textAlign: "right",
              flexShrink: 0,
            }}
          >
            {d.name}
          </div>
          <div
            style={{
              flex: 1,
              background: "#f3f4f6",
              borderRadius: 6,
              height: 22,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${(d.pct / mx) * 100}%`,
                background: `linear-gradient(90deg,${color},${color}cc)`,
                borderRadius: 6,
                height: "100%",
                transition: "width .5s ease",
                minWidth: d.pct > 0 ? 3 : 0,
              }}
            />
            <span
              style={{
                position: "absolute",
                right: 6,
                top: 3,
                fontSize: 10.5,
                color: d.pct > mx * 0.5 ? "#fff" : "#6b7280",
                fontWeight: 600,
              }}
            >
              {d.pct}%{" "}
              <span style={{ fontWeight: 400, opacity: 0.7 }}>n={d.value}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

const TABS = [
  { id: "overview", l: "Overview" },
  { id: "demographics", l: "Demographics" },
  { id: "mobility", l: "Mobility" },
  { id: "criteria", l: "Criteria" },
  { id: "adoption", l: "Adoption & WTP" },
  { id: "segments", l: "Segments" },
  { id: "gre", l: "📚 GRE Vocab" },
];

export default function Dashboard() {
  const [tab, setTab] = useState("overview");
  const [fAge, setFAge] = useState("all");
  const [fOcc, setFOcc] = useState("all");
  const [fVeh, setFVeh] = useState("all");
  const [fRes, setFRes] = useState("all");
  const hasF =
    fAge !== "all" || fOcc !== "all" || fVeh !== "all" || fRes !== "all";
  const reset = () => {
    setFAge("all");
    setFOcc("all");
    setFVeh("all");
    setFRes("all");
  };

  const fd = useMemo(() => {
    let r = D;
    if (fAge !== "all") r = r.filter((x) => x.age === fAge);
    if (fOcc !== "all") r = r.filter((x) => sv(x.occ) === fOcc);
    if (fVeh !== "all") {
      if (fVeh === "has_car")
        r = r.filter((x) => ["car_gas", "car_electric"].includes(sv(x.veh)));
      else if (fVeh === "no_vehicle") r = r.filter((x) => sv(x.veh) === "none");
      else r = r.filter((x) => sv(x.veh) === fVeh);
    }
    if (fRes !== "all") r = r.filter((x) => sv(x.res) === fRes);
    return r;
  }, [fAge, fOcc, fVeh, fRes]);
  const n = fd.length;
  const young = useMemo(
    () => fd.filter((r) => ["18-24", "25-34"].includes(r.age)),
    [fd]
  );
  const stu = useMemo(
    () =>
      young.filter((r) => ["student_uni", "student_hs"].includes(sv(r.occ))),
    [young]
  );
  const yp = useMemo(
    () => young.filter((r) => sv(r.occ) === "young_prof"),
    [young]
  );
  const posI = n
    ? +(
        (fd.filter((r) => ["likely", "very_likely"].includes(r.intent)).length /
          n) *
        100
      ).toFixed(1)
    : 0;
  const w3 = n
    ? +(
        (fd.filter((r) => ["<2", "2-3"].includes(r.wtp)).length / n) *
        100
      ).toFixed(1)
    : 0;
  const intOrd = [
    "very_likely",
    "likely",
    "possible",
    "unlikely",
    "very_unlikely",
  ];
  const intD = intOrd.map((k) => ({
    name: L.intent[k],
    value: fd.filter((r) => r.intent === k).length,
    pct: n
      ? +((fd.filter((r) => r.intent === k).length / n) * 100).toFixed(1)
      : 0,
    key: k,
  }));
  const fM = useMemo(
    () =>
      ["speed", "cost", "comfort", "flexibility", "sustainability"]
        .map((c) => {
          const ps = fd
            .filter((r) => r.factors?.length === 5)
            .map((r) => r.factors.indexOf(c) + 1)
            .filter((p) => p > 0);
          return {
            criterion: L.factors[c],
            mean: ps.length
              ? +(ps.reduce((a, b) => a + b, 0) / ps.length).toFixed(2)
              : 0,
          };
        })
        .sort((a, b) => a.mean - b.mean),
    [fd]
  );
  const rD = useMemo(
    () =>
      ["speed", "cost", "comfort", "flexibility", "sustainability"].map((c) => {
        const f = (s) => {
          const p = s
            .filter((r) => r.factors?.length === 5)
            .map((r) => r.factors.indexOf(c) + 1)
            .filter((x) => x > 0);
          return p.length
            ? +(6 - p.reduce((a, b) => a + b, 0) / p.length).toFixed(2)
            : 0;
        };
        return {
          criterion: L.factors[c],
          Students: f(stu),
          "Young Prof.": f(yp),
        };
      }),
    [stu, yp]
  );

  const font = "'Georgia','Palatino Linotype',serif";
  const tt = ({ active: a, payload: p }) =>
    a && p?.[0] ? (
      <div
        style={{
          background: "#1e293b",
          color: "#fff",
          padding: "6px 10px",
          borderRadius: 6,
          fontSize: 11,
          fontFamily: font,
        }}
      >
        {p[0].payload.name}: <b>{p[0].payload.pct || p[0].value}%</b> (n=
        {p[0].payload.value || ""})
      </div>
    ) : null;

  return (
    <div
      style={{
        fontFamily: font,
        background: "#f8f9fa",
        minHeight: "100vh",
        color: "#1f2937",
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(140deg,#061325 0%,#0c2d48 45%,#145374 100%)",
          padding: "30px 28px 22px",
          borderBottom: "3px solid #2e86ab",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 6,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: "rgba(255,255,255,.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              📊
            </div>
            <div>
              <div
                style={{
                  fontSize: 9.5,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  color: "#5da9c6",
                }}
              >
                Appendix B · Interactive Results
              </div>
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#fff",
                  margin: 0,
                  letterSpacing: -0.3,
                }}
              >
                Urban Mobility Survey — Almería
              </h1>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#a3d5e0", margin: "4px 0 0 52px" }}>
            n = 57 valid responses · Jan 2025 · FH Aachen University of Applied
            Sciences
          </p>
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          position: "sticky",
          top: 0,
          zIndex: 10,
          boxShadow: "0 1px 4px rgba(0,0,0,.06)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            overflowX: "auto",
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "12px 20px",
                fontSize: 12.5,
                fontFamily: font,
                fontWeight: tab === t.id ? 700 : 400,
                color: tab === t.id ? "#0c2d48" : "#9ca3af",
                background: tab === t.id ? "#f0f7ff" : "transparent",
                border: "none",
                borderBottom:
                  tab === t.id
                    ? "2.5px solid #2e86ab"
                    : "2.5px solid transparent",
                cursor: "pointer",
                transition: "all .2s",
                letterSpacing: 0.2,
                whiteSpace: "nowrap",
              }}
            >
              {t.l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 14px" }}>
        <Filters
          {...{
            fAge,
            setFAge,
            fOcc,
            setFOcc,
            fVeh,
            setFVeh,
            fRes,
            setFRes,
            n,
            reset,
            hasF,
          }}
        />

        {n === 0 && (
          <C>
            <p
              style={{
                textAlign: "center",
                color: "#9ca3af",
                padding: 32,
                fontSize: 13,
              }}
            >
              No respondents match current filters.
            </p>
          </C>
        )}

        {n > 0 && tab === "overview" && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <S v={n} l="Respondents" c="#0c2d48" />
              <S v={young.length} l="Target 18–34" c="#145374" />
              <S v={stu.length} l="Students" c="#2e86ab" />
              <S v={yp.length} l="Young Prof." c="#27ae60" />
              <S v={`${posI}%`} l="Positive Adoption" c="#10b981" />
              <S v={`${w3}%`} l="WTP ≤ €3" c="#7b2d8e" />
            </div>
            <C
              title="Adoption Intention Distribution"
              note="5-point Likert scale — intention to use shared electric mobility services."
            >
              <ResponsiveContainer width="100%" height={190}>
                <BarChart
                  data={intD}
                  layout="vertical"
                  margin={{ left: 85, right: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => `${v}%`}
                    style={{ fontSize: 10 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={80}
                    style={{ fontSize: 11, fontFamily: font }}
                  />
                  <Tooltip content={tt} />
                  <Bar dataKey="pct" radius={[0, 5, 5, 0]}>
                    {intD.map((d, i) => (
                      <Cell key={i} fill={IC[d.key]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </C>
            <C
              title="Perceived Mobility Problems"
              note={`Multiple response (n=${n}).`}
            >
              <HB data={cntM(fd, "problems")} color="#0c2d48" />
            </C>
          </>
        )}

        {n > 0 && tab === "demographics" && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              <C title="Age Distribution">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={cnt(fd, "age")}
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      dataKey="value"
                      label={({ name, pct }) => `${name}: ${pct}%`}
                      style={{ fontSize: 10.5 }}
                    >
                      {cnt(fd, "age").map((_, i) => (
                        <Cell key={i} fill={P[i]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </C>
              <C title="Occupation">
                <HB data={cnt(fd, "occ")} color="#2e86ab" />
              </C>
              <C title="Residence">
                <HB data={cnt(fd, "res")} color="#27ae60" />
              </C>
              <C title="Vehicle Ownership">
                <HB data={cnt(fd, "veh")} color="#7b2d8e" />
              </C>
            </div>
          </>
        )}

        {n > 0 && tab === "mobility" && (
          <>
            <C title="Travel Purposes" note="Multiple response.">
              <HB data={cntM(fd, "reasons")} color="#2e86ab" />
            </C>
            <C title="Travel Experience">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={cnt(fd, "exp")} margin={{ left: 5, right: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="name"
                    style={{ fontSize: 10.5, fontFamily: font }}
                  />
                  <YAxis
                    tickFormatter={(v) => `${v}%`}
                    style={{ fontSize: 10 }}
                  />
                  <Tooltip content={tt} />
                  <Bar dataKey="pct" fill="#5da9c6" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </C>
            <C
              title="Barriers to Leaving the Car"
              note="Car owners only. Multiple response."
            >
              <HB data={cntM(fd, "barriers")} color="#e67e22" />
            </C>
          </>
        )}

        {n > 0 && tab === "criteria" && (
          <>
            <C
              title="Decision Factor Rankings"
              note="Mean position: 1 = most important, 5 = least. Lower bar = higher priority."
            >
              <ResponsiveContainer width="100%" height={210}>
                <BarChart
                  data={fM}
                  layout="vertical"
                  margin={{ left: 85, right: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    type="number"
                    domain={[1, 5]}
                    style={{ fontSize: 10 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="criterion"
                    width={80}
                    style={{ fontSize: 11.5, fontFamily: font }}
                  />
                  <Tooltip formatter={(v) => [`Mean: ${v}`]} />
                  <Bar dataKey="mean" fill="#0c2d48" radius={[0, 5, 5, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </C>
            {stu.length >= 3 && yp.length >= 3 && (
              <C
                title="Criteria Radar — Students vs Young Professionals"
                note="Higher value = greater priority (6 minus mean rank)."
              >
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart cx="50%" cy="50%" outerRadius={95} data={rD}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis
                      dataKey="criterion"
                      style={{ fontSize: 10.5, fontFamily: font }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 5]}
                      style={{ fontSize: 9 }}
                    />
                    <Radar
                      name="Students"
                      dataKey="Students"
                      stroke="#2e86ab"
                      fill="#2e86ab"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Young Prof."
                      dataKey="Young Prof."
                      stroke="#27ae60"
                      fill="#27ae60"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, fontFamily: font }} />
                  </RadarChart>
                </ResponsiveContainer>
              </C>
            )}
          </>
        )}

        {n > 0 && tab === "adoption" && (
          <>
            <C title="Willingness to Pay per 20-min Trip">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={cnt(fd, "wtp")} margin={{ left: 5, right: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="name"
                    style={{ fontSize: 10.5, fontFamily: font }}
                  />
                  <YAxis
                    tickFormatter={(v) => `${v}%`}
                    style={{ fontSize: 10 }}
                  />
                  <Tooltip content={tt} />
                  <Bar dataKey="pct" fill="#7b2d8e" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </C>
            <C title="Most Valued Service Features" note="Multiple response.">
              <HB data={cntM(fd, "features")} color="#27ae60" />
            </C>
          </>
        )}

        {n > 0 && tab === "segments" && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
                marginBottom: 14,
              }}
            >
              <C title={`Students (n=${stu.length})`}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 6,
                  }}
                >
                  <S
                    v={
                      stu.length
                        ? `${+(
                            (stu.filter((r) =>
                              ["car_gas", "car_electric"].includes(sv(r.veh))
                            ).length /
                              stu.length) *
                            100
                          ).toFixed(1)}%`
                        : "—"
                    }
                    l="Car Owner"
                    c="#2e86ab"
                  />
                  <S
                    v={
                      stu.length
                        ? `${+(
                            (stu.filter((r) => sv(r.veh) === "none").length /
                              stu.length) *
                            100
                          ).toFixed(1)}%`
                        : "—"
                    }
                    l="No Vehicle"
                    c="#2e86ab"
                  />
                  <S
                    v={
                      stu.length
                        ? `${+(
                            (stu.filter((r) =>
                              ["likely", "very_likely"].includes(r.intent)
                            ).length /
                              stu.length) *
                            100
                          ).toFixed(1)}%`
                        : "—"
                    }
                    l="Positive Intent"
                    c="#2e86ab"
                  />
                  <S
                    v={
                      stu.length
                        ? `${+(
                            (stu.filter((r) => ["<2", "2-3"].includes(r.wtp))
                              .length /
                              stu.length) *
                            100
                          ).toFixed(1)}%`
                        : "—"
                    }
                    l="WTP ≤ €3"
                    c="#2e86ab"
                  />
                </div>
              </C>
              <C title={`Young Professionals (n=${yp.length})`}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 6,
                  }}
                >
                  <S
                    v={
                      yp.length
                        ? `${+(
                            (yp.filter((r) =>
                              ["car_gas", "car_electric"].includes(sv(r.veh))
                            ).length /
                              yp.length) *
                            100
                          ).toFixed(1)}%`
                        : "—"
                    }
                    l="Car Owner"
                    c="#27ae60"
                  />
                  <S
                    v={
                      yp.length
                        ? `${+(
                            (yp.filter((r) => sv(r.veh) === "none").length /
                              yp.length) *
                            100
                          ).toFixed(1)}%`
                        : "—"
                    }
                    l="No Vehicle"
                    c="#27ae60"
                  />
                  <S
                    v={
                      yp.length
                        ? `${+(
                            (yp.filter((r) =>
                              ["likely", "very_likely"].includes(r.intent)
                            ).length /
                              yp.length) *
                            100
                          ).toFixed(1)}%`
                        : "—"
                    }
                    l="Positive Intent"
                    c="#27ae60"
                  />
                  <S
                    v={
                      yp.length
                        ? `${+(
                            (yp.filter((r) => ["<2", "2-3"].includes(r.wtp))
                              .length /
                              yp.length) *
                            100
                          ).toFixed(1)}%`
                        : "—"
                    }
                    l="WTP ≤ €3"
                    c="#27ae60"
                  />
                </div>
              </C>
            </div>
            {stu.length > 0 && yp.length > 0 && (
              <C title="Adoption Intention by Segment">
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart
                    data={intOrd.map((k) => ({
                      name: L.intent[k],
                      Students: stu.length
                        ? +(
                            (stu.filter((r) => r.intent === k).length /
                              stu.length) *
                            100
                          ).toFixed(1)
                        : 0,
                      "Young Prof.": yp.length
                        ? +(
                            (yp.filter((r) => r.intent === k).length /
                              yp.length) *
                            100
                          ).toFixed(1)
                        : 0,
                    }))}
                    margin={{ left: 5, right: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis
                      dataKey="name"
                      style={{ fontSize: 10.5, fontFamily: font }}
                    />
                    <YAxis
                      tickFormatter={(v) => `${v}%`}
                      style={{ fontSize: 10 }}
                    />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Bar
                      dataKey="Students"
                      fill="#2e86ab"
                      radius={[5, 5, 0, 0]}
                    />
                    <Bar
                      dataKey="Young Prof."
                      fill="#27ae60"
                      radius={[5, 5, 0, 0]}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, fontFamily: font }} />
                  </BarChart>
                </ResponsiveContainer>
              </C>
            )}
          </>
        )}
      </div>

      {tab === "gre" && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
          <GREVocabNotifications />
        </div>
      )}

      <div
        style={{
          borderTop: "1px solid #e5e7eb",
          padding: "14px 28px",
          textAlign: "center",
          color: "#9ca3af",
          fontSize: 10.5,
          fontFamily: font,
          background: "#fff",
        }}
      >
        Source: Primary survey data, January 2025 · n = 57 valid responses ·
        Progressive Web Application · Bachelor Thesis — S. Essoubai Chikh, FH
        Aachen
      </div>
    </div>
  );
}
