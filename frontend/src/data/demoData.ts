import { User } from '../types/user';
import { CPSE } from '../types/cpse';
import { Material } from '../types/material';
import { CanonicalMaterial } from '../types/canonical';
import { HarmonizationResult, DuplicateGroup } from '../types/harmonization';
import { ReviewItem } from '../types/review';
import { TaxonomyNode } from '../types/taxonomy';
import { OverviewStats, CPSEHarmonizationStat, CategoryStat, MonthlyProcessingTrend, MLModelStatus, AuditLogItem } from '../types/analytics';

export const DEMO_USERS: User[] = [
  {
    id: 'usr-1',
    employeeId: 'EMP-40892',
    name: 'Rajesh Sharma',
    email: 'rajesh.sharma@ongc.res.in',
    cpse: 'ONGC',
    role: 'USER',
    designation: 'Senior Materials Executive',
    status: 'ACTIVE',
    lastLogin: '2026-09-18T10:15:00Z',
    createdAt: '2025-01-10T08:00:00Z',
  },
  {
    id: 'usr-2',
    employeeId: 'ADM-10021',
    name: 'Dr. Ananya Iyer',
    email: 'ananya.iyer@gov.dpe.in',
    cpse: 'Department of Public Enterprises',
    role: 'ADMIN',
    designation: 'Chief Standardization Director',
    status: 'ACTIVE',
    lastLogin: '2026-09-18T11:42:00Z',
    createdAt: '2024-11-01T08:00:00Z',
  },
  {
    id: 'usr-3',
    employeeId: 'REV-20034',
    name: 'Vikramaditya Sen',
    email: 'v.sen@ntpc.co.in',
    cpse: 'NTPC',
    role: 'REVIEWER',
    designation: 'Lead Procurement Auditor',
    status: 'ACTIVE',
    lastLogin: '2026-09-17T16:20:00Z',
    createdAt: '2025-02-15T09:30:00Z',
  },
];

export const DEMO_CPSES: CPSE[] = [
  { code: 'ONGC', name: 'Oil and Natural Gas Corporation', ministry: 'Ministry of Petroleum & Natural Gas', sector: 'Petroleum', materialsCount: 142500, harmonizedCount: 121800, status: 'INTEGRATED' },
  { code: 'BHEL', name: 'Bharat Heavy Electricals Limited', ministry: 'Ministry of Heavy Industries', sector: 'Heavy Engineering', materialsCount: 189200, harmonizedCount: 154700, status: 'INTEGRATED' },
  { code: 'NTPC', name: 'NTPC Limited', ministry: 'Ministry of Power', sector: 'Power', materialsCount: 112400, harmonizedCount: 98600, status: 'INTEGRATED' },
  { code: 'SAIL', name: 'Steel Authority of India Limited', ministry: 'Ministry of Steel', sector: 'Steel', materialsCount: 165800, harmonizedCount: 132400, status: 'INTEGRATED' },
  { code: 'IOCL', name: 'Indian Oil Corporation Limited', ministry: 'Ministry of Petroleum & Natural Gas', sector: 'Petroleum', materialsCount: 128900, harmonizedCount: 104500, status: 'INTEGRATED' },
  { code: 'GAIL', name: 'GAIL (India) Limited', ministry: 'Ministry of Petroleum & Natural Gas', sector: 'Energy', materialsCount: 76300, harmonizedCount: 65100, status: 'ACTIVE' },
  { code: 'CIL', name: 'Coal India Limited', ministry: 'Ministry of Coal', sector: 'Mining', materialsCount: 98400, harmonizedCount: 71200, status: 'PENDING' },
];

export const DEMO_CANONICAL_MATERIALS: CanonicalMaterial[] = [
  {
    id: 'cm-1',
    canonicalCode: 'CM-000124',
    standardName: 'Stainless Steel 316 Hex Bolt M16 × 50 mm',
    description: 'High-tensile corrosion resistant Grade 316 austenitic stainless steel hexagonal head fastener with metric coarse thread pitch 2.0mm and partial shank.',
    category: 'Mechanical',
    categoryPath: ['Mechanical', 'Fasteners', 'Bolts'],
    unspscCode: '31161620',
    standardAttributes: {
      'Item Type': 'Hex Bolt',
      'Material': 'Stainless Steel',
      'Grade': 'SS316',
      'Diameter': 'M16',
      'Length': '50 mm',
      'Thread Type': 'Metric Coarse',
      'Standard': 'ISO 4014 / DIN 931'
    },
    sourceMaterials: [
      { cpse: 'ONGC', materialCode: 'MAT-ONGC-4091', originalDescription: 'M16 HEX BOLT SS316 X 50MM', mappedAt: '2026-08-10T14:30:00Z', mappedBy: 'AI Auto-Harmonization' },
      { cpse: 'BHEL', materialCode: 'BHEL-FAST-9921', originalDescription: 'BOLT HEX HD M16X50 S316 DIN931', mappedAt: '2026-08-12T10:15:00Z', mappedBy: 'Reviewer Vikramaditya Sen' },
      { cpse: 'NTPC', materialCode: 'NTPC-MECH-3312', originalDescription: 'SS316 FASTENER BOLT HEX M16-50', mappedAt: '2026-08-15T11:45:00Z', mappedBy: 'AI Auto-Harmonization' },
    ],
    status: 'ACTIVE',
    createdAt: '2026-07-01T09:00:00Z',
    updatedAt: '2026-08-15T11:45:00Z'
  },
  {
    id: 'cm-2',
    canonicalCode: 'CM-000125',
    standardName: 'Carbon Steel Ball Valve 2 Inch Class 150 Flanged RF',
    description: 'Two-piece split body design full bore ball valve, body ASTM A216 WCB, trim SS316, PTFE seated, ASME B16.5 raised face flanged connections.',
    category: 'Valves',
    categoryPath: ['Piping & Fittings', 'Valves', 'Ball Valves'],
    unspscCode: '40141607',
    standardAttributes: {
      'Valve Type': 'Ball Valve',
      'Body Material': 'ASTM A216 WCB',
      'Trim Material': 'SS316',
      'Nominal Size': '2 Inch (DN50)',
      'Pressure Class': 'Class 150',
      'End Connection': 'Flanged Raised Face (RF)',
      'Design Standard': 'API 6D / ASME B16.34'
    },
    sourceMaterials: [
      { cpse: 'IOCL', materialCode: 'IOCL-VLV-5541', originalDescription: 'VALVE BALL 2IN 150# CS FLGD RF WCB', mappedAt: '2026-08-01T12:00:00Z', mappedBy: 'AI Auto-Harmonization' },
      { cpse: 'GAIL', materialCode: 'GAIL-PL-7782', originalDescription: 'BALL VALVE 50NB CL150 WCB BODY/SS316 TRIM RF', mappedAt: '2026-08-05T09:30:00Z', mappedBy: 'Reviewer Vikramaditya Sen' },
    ],
    status: 'ACTIVE',
    createdAt: '2026-07-05T10:00:00Z',
    updatedAt: '2026-08-05T09:30:00Z'
  },
  {
    id: 'cm-3',
    canonicalCode: 'CM-000126',
    standardName: 'Seamless Carbon Steel Pipe 4 Inch Sch 40 ASTM A106 Gr B',
    description: 'Hot finished or cold drawn seamless carbon steel pipe for high-temperature service conforming to ASME B36.10M plain ends bevelled.',
    category: 'Piping & Fittings',
    categoryPath: ['Piping & Fittings', 'Pipes', 'Seamless Pipes'],
    unspscCode: '40171512',
    standardAttributes: {
      'Item Type': 'Seamless Pipe',
      'Material': 'Carbon Steel',
      'Grade': 'ASTM A106 Grade B',
      'Nominal Size': '4 Inch (DN100)',
      'Schedule / Wall': 'SCH 40',
      'Length': '6 Metres (Double Random)',
      'End Finish': 'Bevelled Ends (BE)'
    },
    sourceMaterials: [
      { cpse: 'ONGC', materialCode: 'MAT-ONGC-9810', originalDescription: 'PIPE CS SMLS 4IN SCH40 A106-B BE', mappedAt: '2026-08-02T15:20:00Z', mappedBy: 'AI Auto-Harmonization' },
      { cpse: 'IOCL', materialCode: 'IOCL-PIP-1120', originalDescription: 'CS PIPE SEAMLESS 100NB SCH 40 A106 GR.B', mappedAt: '2026-08-08T11:10:00Z', mappedBy: 'Reviewer Vikramaditya Sen' },
    ],
    status: 'ACTIVE',
    createdAt: '2026-07-10T11:00:00Z',
    updatedAt: '2026-08-08T11:10:00Z'
  },
  {
    id: 'cm-4',
    canonicalCode: 'CM-000127',
    standardName: 'Three Phase Induction Motor 15 kW 415V 1440 RPM Foot Mounted IE3',
    description: 'Squirrel cage high efficiency IE3 premium induction motor, cast iron housing, IP55 enclosure, Class F insulation with Class B temperature rise.',
    category: 'Electrical',
    categoryPath: ['Electrical', 'Motors', 'Induction Motors'],
    unspscCode: '26101202',
    standardAttributes: {
      'Motor Type': 'Three Phase Induction',
      'Power Rating': '15 kW (20 HP)',
      'Voltage': '415 V',
      'Speed': '1440 RPM (4 Pole)',
      'Efficiency Class': 'IE3 Premium',
      'Enclosure': 'IP55 TEFC',
      'Mounting': 'B3 Foot Mounted'
    },
    sourceMaterials: [
      { cpse: 'BHEL', materialCode: 'BHEL-ELEC-4401', originalDescription: 'MOTOR 15KW 415V 1440RPM IE3 B3 CAST IRON', mappedAt: '2026-08-14T16:00:00Z', mappedBy: 'AI Auto-Harmonization' },
      { cpse: 'NTPC', materialCode: 'NTPC-GEN-8831', originalDescription: '3PH SQ CAGE MOTOR 15 KW 415V 4 POLE FOOT', mappedAt: '2026-08-16T14:20:00Z', mappedBy: 'AI Auto-Harmonization' },
    ],
    status: 'ACTIVE',
    createdAt: '2026-07-12T08:30:00Z',
    updatedAt: '2026-08-16T14:20:00Z'
  },
  {
    id: 'cm-5',
    canonicalCode: 'CM-000128',
    standardName: 'Spiral Wound Gasket 3 Inch Class 300 SS316 with Flexible Graphite Filler',
    description: 'Spiral wound gasket with 316 stainless steel winding wire, flexible graphite filler, with CS outer centering ring and SS316 inner ring to ASME B16.20.',
    category: 'Piping & Fittings',
    categoryPath: ['Piping & Fittings', 'Gaskets', 'Spiral Wound'],
    unspscCode: '31401501',
    standardAttributes: {
      'Gasket Type': 'Spiral Wound Gasket',
      'Winding Material': 'SS316',
      'Filler Material': 'Flexible Graphite',
      'Centering Ring': 'Carbon Steel',
      'Inner Ring': 'SS316',
      'Nominal Size': '3 Inch (DN80)',
      'Pressure Class': 'Class 300'
    },
    sourceMaterials: [],
    status: 'ACTIVE',
    createdAt: '2026-07-20T10:00:00Z',
    updatedAt: '2026-07-20T10:00:00Z'
  }
];

export const DEMO_MATERIALS: Material[] = [
  {
    id: 'mat-1',
    materialCode: 'MAT-ONGC-4091',
    cpse: 'ONGC',
    originalDescription: 'M16 HEX BOLT SS316 X 50MM',
    normalizedDescription: 'Stainless Steel 316 Hex Bolt M16 × 50 mm Metric Coarse DIN 931',
    category: 'Mechanical',
    subCategory: 'Fasteners',
    status: 'HARMONIZED',
    canonicalCode: 'CM-000124',
    canonicalName: 'Stainless Steel 316 Hex Bolt M16 × 50 mm',
    attributes: {
      'Type': 'Hex Bolt',
      'Material': 'Stainless Steel',
      'Grade': 'SS316',
      'Diameter': 'M16',
      'Length': '50 mm'
    },
    extractedAttributes: [
      { key: 'type', label: 'Item Type', value: 'Hex Bolt', confidence: 0.98 },
      { key: 'material', label: 'Material', value: 'Stainless Steel', confidence: 0.99 },
      { key: 'grade', label: 'Grade', value: 'SS316', confidence: 0.97 },
      { key: 'diameter', label: 'Diameter', value: 'M16', unit: 'mm', confidence: 0.99 },
      { key: 'length', label: 'Length', value: '50', unit: 'mm', confidence: 0.99 },
    ],
    confidenceScore: 95,
    createdAt: '2026-08-10T12:00:00Z',
    updatedAt: '2026-08-10T14:30:00Z',
    auditTrail: [
      { timestamp: '2026-08-10T12:00:00Z', action: 'BATCH_UPLOAD', actor: 'Rajesh Sharma (ONGC)', notes: 'Ingested via ONGC_Q3_Procurement.csv' },
      { timestamp: '2026-08-10T12:02:15Z', action: 'AI_ATTRIBUTE_EXTRACTION', actor: 'FastAPI ML Service', notes: 'NER extracted 5 standard attributes' },
      { timestamp: '2026-08-10T12:02:30Z', action: 'SEMANTIC_MATCH', actor: 'Spring Boot Matching Engine', notes: 'Matched with CM-000124 (Score: 95%)' },
      { timestamp: '2026-08-10T14:30:00Z', action: 'HARMONIZED', actor: 'Auto-Approval Pipeline', notes: 'Exceeded 95% confidence threshold' },
    ]
  },
  {
    id: 'mat-2',
    materialCode: 'BHEL-FAST-9921',
    cpse: 'BHEL',
    originalDescription: 'BOLT HEX HD M16X50 S316 DIN931',
    normalizedDescription: 'Stainless Steel 316 Hex Bolt M16 × 50 mm DIN 931',
    category: 'Mechanical',
    subCategory: 'Fasteners',
    status: 'HARMONIZED',
    canonicalCode: 'CM-000124',
    canonicalName: 'Stainless Steel 316 Hex Bolt M16 × 50 mm',
    attributes: {
      'Type': 'Hex Bolt',
      'Material': 'Stainless Steel',
      'Grade': 'SS316',
      'Diameter': 'M16',
      'Length': '50 mm',
      'Standard': 'DIN 931'
    },
    extractedAttributes: [
      { key: 'type', label: 'Item Type', value: 'Hex Bolt', confidence: 0.96 },
      { key: 'grade', label: 'Grade', value: 'SS316', confidence: 0.95 },
      { key: 'diameter', label: 'Diameter', value: 'M16', confidence: 0.98 },
      { key: 'length', label: 'Length', value: '50 mm', confidence: 0.98 },
    ],
    confidenceScore: 92,
    createdAt: '2026-08-11T09:00:00Z',
    updatedAt: '2026-08-12T10:15:00Z',
    auditTrail: [
      { timestamp: '2026-08-11T09:00:00Z', action: 'BATCH_UPLOAD', actor: 'BHEL Ingestion Service' },
      { timestamp: '2026-08-12T10:15:00Z', action: 'REVIEW_APPROVED', actor: 'Vikramaditya Sen (NTPC)', notes: 'Verified cross-CPSE equivalence' }
    ]
  },
  {
    id: 'mat-3',
    materialCode: 'IOCL-VLV-5541',
    cpse: 'IOCL',
    originalDescription: 'VALVE BALL 2IN 150# CS FLGD RF WCB',
    normalizedDescription: 'Carbon Steel WCB Ball Valve 2" Class 150 Flanged Raised Face',
    category: 'Valves',
    subCategory: 'Ball Valves',
    status: 'HARMONIZED',
    canonicalCode: 'CM-000125',
    canonicalName: 'Carbon Steel Ball Valve 2 Inch Class 150 Flanged RF',
    attributes: {
      'Valve Type': 'Ball Valve',
      'Size': '2 Inch',
      'Pressure Class': '150#',
      'Material': 'WCB Carbon Steel',
      'Connection': 'Flanged RF'
    },
    extractedAttributes: [
      { key: 'type', label: 'Valve Type', value: 'Ball Valve', confidence: 0.99 },
      { key: 'size', label: 'Nominal Size', value: '2 Inch', confidence: 0.97 },
      { key: 'rating', label: 'Pressure Rating', value: 'Class 150', confidence: 0.98 },
      { key: 'material', label: 'Material', value: 'ASTM A216 WCB', confidence: 0.95 },
    ],
    confidenceScore: 96,
    createdAt: '2026-07-28T14:10:00Z',
    updatedAt: '2026-08-01T12:00:00Z'
  },
  {
    id: 'mat-4',
    materialCode: 'SAIL-RAW-8012',
    cpse: 'SAIL',
    originalDescription: 'SS FLANGE 3 INCH 300 LBS WNRF 316L',
    normalizedDescription: 'Stainless Steel 316L Weld Neck Flange 3" Class 300 Raised Face',
    category: 'Piping & Fittings',
    subCategory: 'Flanges',
    status: 'PENDING_REVIEW',
    attributes: {
      'Type': 'Weld Neck Flange',
      'Size': '3 Inch',
      'Rating': '300 LBS',
      'Material': 'SS316L'
    },
    extractedAttributes: [
      { key: 'type', label: 'Flange Type', value: 'Weld Neck Raised Face', confidence: 0.94 },
      { key: 'size', label: 'Size', value: '3 Inch', confidence: 0.98 },
      { key: 'rating', label: 'Pressure Class', value: 'Class 300', confidence: 0.95 },
      { key: 'grade', label: 'Material Grade', value: 'SS316L', confidence: 0.97 },
    ],
    confidenceScore: 78,
    createdAt: '2026-09-15T11:20:00Z',
    updatedAt: '2026-09-15T11:25:00Z'
  },
  {
    id: 'mat-5',
    materialCode: 'GAIL-PL-7782',
    cpse: 'GAIL',
    originalDescription: 'BALL VALVE 50NB CL150 WCB BODY/SS316 TRIM RF',
    normalizedDescription: 'Carbon Steel Ball Valve 50NB (2") Class 150 WCB SS316 Trim RF',
    category: 'Valves',
    subCategory: 'Ball Valves',
    status: 'HARMONIZED',
    canonicalCode: 'CM-000125',
    canonicalName: 'Carbon Steel Ball Valve 2 Inch Class 150 Flanged RF',
    attributes: {
      'Valve Type': 'Ball Valve',
      'Size': '50NB (2 Inch)',
      'Rating': 'Class 150',
      'Body': 'WCB',
      'Trim': 'SS316'
    },
    extractedAttributes: [
      { key: 'type', label: 'Valve Type', value: 'Ball Valve', confidence: 0.97 },
      { key: 'size', label: 'Size', value: '50NB', confidence: 0.96 },
      { key: 'class', label: 'Pressure Class', value: 'Class 150', confidence: 0.99 },
    ],
    confidenceScore: 91,
    createdAt: '2026-08-04T08:15:00Z',
    updatedAt: '2026-08-05T09:30:00Z'
  },
  {
    id: 'mat-6',
    materialCode: 'NTPC-ELEC-9021',
    cpse: 'NTPC',
    originalDescription: 'XLPE ARMORED CABLE 4 CORE 185 SQMM 1.1KV AL',
    normalizedDescription: 'Aluminum 1.1kV 4 Core 185 mm² XLPE Insulated Armored Power Cable IS 7098',
    category: 'Electrical',
    subCategory: 'Cables & Conductors',
    status: 'PENDING_REVIEW',
    attributes: {
      'Type': 'Armored Power Cable',
      'Conductor': 'Aluminum',
      'Cores': '4 Core',
      'Cross Section': '185 sqmm',
      'Voltage': '1.1 kV',
      'Insulation': 'XLPE'
    },
    extractedAttributes: [
      { key: 'insulation', label: 'Insulation', value: 'XLPE', confidence: 0.99 },
      { key: 'cores', label: 'Cores', value: '4 Core', confidence: 0.98 },
      { key: 'csa', label: 'Cross Section', value: '185 sq mm', confidence: 0.97 },
      { key: 'voltage', label: 'Voltage Grade', value: '1.1 kV', confidence: 0.99 },
      { key: 'conductor', label: 'Conductor', value: 'Aluminum', confidence: 0.98 }
    ],
    confidenceScore: 82,
    createdAt: '2026-09-16T14:40:00Z',
    updatedAt: '2026-09-16T14:45:00Z'
  },
  {
    id: 'mat-7',
    materialCode: 'ONGC-INST-3012',
    cpse: 'ONGC',
    originalDescription: 'PRESSURE TX 0-10BAR 4-20MA HART 1/2NPT EXD',
    normalizedDescription: 'Explosion Proof Pressure Transmitter 0-10 Bar Output 4-20mA with HART Protocol',
    category: 'Instrumentation & Control',
    subCategory: 'Transmitters',
    status: 'MATCHED',
    canonicalCode: 'CM-000129',
    canonicalName: 'Pressure Transmitter 4-20mA HART Range 0-10 Bar',
    attributes: {
      'Type': 'Pressure Transmitter',
      'Range': '0-10 Bar',
      'Output': '4-20mA HART',
      'Process Conn': '1/2" NPT',
      'Enclosure': 'Ex-d Flameproof'
    },
    extractedAttributes: [
      { key: 'type', label: 'Instrument Type', value: 'Pressure Transmitter', confidence: 0.98 },
      { key: 'range', label: 'Calibrated Range', value: '0 - 10 Bar', confidence: 0.96 },
      { key: 'protocol', label: 'Communication', value: '4-20mA HART', confidence: 0.99 },
    ],
    confidenceScore: 94,
    createdAt: '2026-09-17T10:10:00Z',
    updatedAt: '2026-09-17T10:15:00Z'
  },
  {
    id: 'mat-8',
    materialCode: 'BHEL-PUMP-1190',
    cpse: 'BHEL',
    originalDescription: 'CENTRIFUGAL WATER PUMP 50M3/HR 60M HEAD 15KW',
    normalizedDescription: 'Horizontal End Suction Centrifugal Pump Flow 50 m³/h Head 60m 15kW Motor',
    category: 'Mechanical',
    subCategory: 'Pumps',
    status: 'RAW',
    attributes: {
      'Type': 'Centrifugal Pump',
      'Capacity': '50 m3/hr',
      'Head': '60 m',
      'Power': '15 kW'
    },
    extractedAttributes: [
      { key: 'type', label: 'Pump Type', value: 'Centrifugal Water Pump', confidence: 0.95 },
      { key: 'capacity', label: 'Flow Rate', value: '50 m³/hr', confidence: 0.92 },
      { key: 'head', label: 'Discharge Head', value: '60 m', confidence: 0.93 },
    ],
    confidenceScore: 68,
    createdAt: '2026-09-18T08:30:00Z',
    updatedAt: '2026-09-18T08:35:00Z'
  }
];

export const DEMO_REVIEW_ITEMS: ReviewItem[] = [
  {
    id: 'rev-1',
    material: DEMO_MATERIALS[3], // SAIL SS FLANGE 3 INCH 300 LBS WNRF 316L
    suggestedCanonical: {
      id: 'cm-temp-1',
      canonicalCode: 'CM-000410',
      standardName: 'Stainless Steel 316/316L Weld Neck Flange 3 Inch Class 300 RF ASME B16.5',
      description: 'Forged austenitic stainless steel dual certified 316/316L weld neck flange class 300 raised face schedule 40 bore.',
      category: 'Piping & Fittings',
      categoryPath: ['Piping & Fittings', 'Flanges', 'Weld Neck Flanges'],
      unspscCode: '40173302',
      standardAttributes: {
        'Flange Type': 'Weld Neck Flange (WNRF)',
        'Nominal Pipe Size': '3 Inch (DN80)',
        'Pressure Class': 'Class 300',
        'Material Grade': 'ASTM A182 F316/F316L Dual Certified',
        'Face Type': 'Raised Face (RF)',
        'Design Code': 'ASME B16.5'
      },
      sourceMaterials: [],
      status: 'ACTIVE',
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z'
    },
    scores: {
      semanticScore: 88,
      attributeScore: 92,
      lexicalScore: 82,
      finalConfidence: 87
    },
    explanation: {
      matchedAttributes: [
        { key: 'Flange Type', sourceValue: 'Weld Neck Flange', targetValue: 'Weld Neck Flange (WNRF)' },
        { key: 'Size', sourceValue: '3 Inch', targetValue: '3 Inch (DN80)' },
        { key: 'Pressure Rating', sourceValue: '300 LBS', targetValue: 'Class 300' },
        { key: 'Material', sourceValue: 'SS316L', targetValue: 'ASTM A182 F316/F316L' }
      ],
      unmatchedAttributes: [
        { key: 'Bore Schedule', sourceValue: 'Unspecified in source', targetValue: 'SCH 40' }
      ],
      appliedRules: [
        'Domain rule: 300 LBS maps to ANSI Class 300',
        'Domain rule: SS316L compatible with dual-grade F316/F316L',
        'Semantic confidence threshold reached (>85%)'
      ],
      notes: 'Please verify if the flange bore matches SCH 40 before approval.'
    },
    status: 'PENDING',
    priority: 'HIGH',
    createdAt: '2026-09-15T11:25:00Z'
  },
  {
    id: 'rev-2',
    material: DEMO_MATERIALS[5], // NTPC XLPE ARMORED CABLE 4 CORE 185 SQMM
    suggestedCanonical: {
      id: 'cm-temp-2',
      canonicalCode: 'CM-000520',
      standardName: 'Aluminum 1.1kV 4 Core 185 mm² XLPE Armored Cable IS 7098 Part 1',
      description: 'Heavy duty stranded compacted circular aluminum conductor XLPE insulated, inner sheathed, galvanized steel strip armored, overall PVC sheathed power cable.',
      category: 'Electrical',
      categoryPath: ['Electrical', 'Cables & Conductors', 'Armored Power Cables'],
      unspscCode: '26121629',
      standardAttributes: {
        'Conductor Material': 'Aluminum (Stranded Class 2)',
        'Number of Cores': '4 Core',
        'Nominal Area': '185 mm²',
        'Insulation Type': 'Cross-linked Polyethylene (XLPE)',
        'Voltage Rating': '1100 V (1.1 kV)',
        'Armoring': 'Galvanized Steel Strip (A2XFY)',
        'Governing Standard': 'IS 7098 Part 1'
      },
      sourceMaterials: [],
      status: 'ACTIVE',
      createdAt: '2026-08-05T00:00:00Z',
      updatedAt: '2026-08-05T00:00:00Z'
    },
    scores: {
      semanticScore: 84,
      attributeScore: 95,
      lexicalScore: 78,
      finalConfidence: 86
    },
    explanation: {
      matchedAttributes: [
        { key: 'Conductor', sourceValue: 'AL', targetValue: 'Aluminum' },
        { key: 'Cores', sourceValue: '4 CORE', targetValue: '4 Core' },
        { key: 'Nominal Area', sourceValue: '185 SQMM', targetValue: '185 mm²' },
        { key: 'Insulation', sourceValue: 'XLPE', targetValue: 'XLPE' },
        { key: 'Voltage', sourceValue: '1.1KV', targetValue: '1100 V (1.1 kV)' }
      ],
      unmatchedAttributes: [],
      appliedRules: [
        'Acronym expansion: AL expanded to Aluminum',
        'Acronym expansion: SQMM normalized to mm²',
        'Voltage normalized: 1.1KV to 1100V'
      ],
      notes: 'Matches all critical electrical cable parameters.'
    },
    status: 'PENDING',
    priority: 'MEDIUM',
    createdAt: '2026-09-16T14:45:00Z'
  },
  {
    id: 'rev-3',
    material: DEMO_MATERIALS[7], // BHEL CENTRIFUGAL WATER PUMP 50M3/HR 60M HEAD 15KW
    suggestedCanonical: {
      id: 'cm-temp-3',
      canonicalCode: 'CM-000880',
      standardName: 'Horizontal End Suction Centrifugal Water Pump 50 m³/h 60m Head Cast Iron',
      description: 'Back pull-out centrifugal pump for industrial water circulation, cast iron casing, bronze impeller, mechanical seal, direct coupled with 15kW IE3 motor.',
      category: 'Mechanical',
      categoryPath: ['Mechanical', 'Pumps', 'Centrifugal Pumps'],
      unspscCode: '40151503',
      standardAttributes: {
        'Pump Category': 'Centrifugal End Suction',
        'Discharge Flow': '50 m³/hr',
        'Total Head': '60 Metres',
        'Driver Power': '15 kW',
        'Casing Material': 'Cast Iron FG 260',
        'Shaft Sealing': 'Mechanical Seal'
      },
      sourceMaterials: [],
      status: 'ACTIVE',
      createdAt: '2026-08-10T00:00:00Z',
      updatedAt: '2026-08-10T00:00:00Z'
    },
    scores: {
      semanticScore: 75,
      attributeScore: 82,
      lexicalScore: 68,
      finalConfidence: 75
    },
    explanation: {
      matchedAttributes: [
        { key: 'Pump Type', sourceValue: 'CENTRIFUGAL WATER PUMP', targetValue: 'Centrifugal End Suction' },
        { key: 'Capacity', sourceValue: '50M3/HR', targetValue: '50 m³/hr' },
        { key: 'Head', sourceValue: '60M HEAD', targetValue: '60 Metres' },
        { key: 'Power', sourceValue: '15KW', targetValue: '15 kW' }
      ],
      unmatchedAttributes: [
        { key: 'Casing Material', sourceValue: 'Not specified in original text', targetValue: 'Cast Iron FG 260' }
      ],
      appliedRules: [
        'Attribute extraction: Flow and Head matched with standard pump sizing matrix',
        'Warning: Material of construction not found in source string'
      ],
      notes: 'Requires technical confirmation on casing material (Cast Iron vs Stainless Steel).'
    },
    status: 'PENDING',
    priority: 'LOW',
    createdAt: '2026-09-18T08:35:00Z'
  }
];

export const DEMO_DUPLICATES: DuplicateGroup[] = [
  {
    id: 'dup-1',
    canonicalCandidateCode: 'CM-000124',
    canonicalCandidateName: 'Stainless Steel 316 Hex Bolt M16 × 50 mm',
    confidence: 96,
    itemType: 'Fastener / Bolt',
    materials: [
      {
        cpse: 'ONGC',
        materialCode: 'MAT-ONGC-4091',
        description: 'M16 HEX BOLT SS316 X 50MM',
        attributes: { 'Type': 'Hex Bolt', 'Grade': 'SS316', 'Diameter': 'M16', 'Length': '50 mm', 'Standard': 'ISO 4014' }
      },
      {
        cpse: 'BHEL',
        materialCode: 'BHEL-FAST-9921',
        description: 'BOLT HEX HD M16X50 S316 DIN931',
        attributes: { 'Type': 'HEX BOLT', 'Grade': '316', 'Diameter': 'M16', 'Length': '50 mm', 'Standard': 'DIN 931' }
      },
      {
        cpse: 'NTPC',
        materialCode: 'NTPC-MECH-3312',
        description: 'SS316 FASTENER BOLT HEX M16-50',
        attributes: { 'Type': 'Hex Bolt', 'Grade': 'Stainless Steel 316', 'Diameter': 'M16', 'Length': '50mm', 'Standard': 'Not specified' }
      }
    ]
  },
  {
    id: 'dup-2',
    canonicalCandidateCode: 'CM-000125',
    canonicalCandidateName: 'Carbon Steel Ball Valve 2 Inch Class 150 Flanged RF',
    confidence: 94,
    itemType: 'Valves / Ball Valve',
    materials: [
      {
        cpse: 'IOCL',
        materialCode: 'IOCL-VLV-5541',
        description: 'VALVE BALL 2IN 150# CS FLGD RF WCB',
        attributes: { 'Valve Type': 'Ball Valve', 'Size': '2 Inch', 'Rating': '150#', 'Material': 'WCB', 'Connection': 'Flanged RF' }
      },
      {
        cpse: 'GAIL',
        materialCode: 'GAIL-PL-7782',
        description: 'BALL VALVE 50NB CL150 WCB BODY/SS316 TRIM RF',
        attributes: { 'Valve Type': 'Ball Valve', 'Size': '50NB (2")', 'Rating': 'Class 150', 'Material': 'ASTM A216 WCB', 'Connection': 'RF' }
      }
    ]
  },
  {
    id: 'dup-3',
    canonicalCandidateCode: 'CM-000126',
    canonicalCandidateName: 'Seamless Carbon Steel Pipe 4 Inch Sch 40 ASTM A106 Gr B',
    confidence: 92,
    itemType: 'Piping / Seamless Pipe',
    materials: [
      {
        cpse: 'ONGC',
        materialCode: 'MAT-ONGC-9810',
        description: 'PIPE CS SMLS 4IN SCH40 A106-B BE',
        attributes: { 'Type': 'Seamless Pipe', 'Size': '4 Inch', 'Schedule': 'SCH 40', 'Grade': 'A106-B', 'End': 'Bevelled' }
      },
      {
        cpse: 'IOCL',
        materialCode: 'IOCL-PIP-1120',
        description: 'CS PIPE SEAMLESS 100NB SCH 40 A106 GR.B',
        attributes: { 'Type': 'SEAMLESS PIPE', 'Size': '100NB (4 Inch)', 'Schedule': 'SCH 40', 'Grade': 'ASTM A106 Gr B', 'End': 'Plain/Bevel' }
      }
    ]
  }
];

export const DEMO_TAXONOMY: TaxonomyNode[] = [
  {
    id: 'tax-1',
    code: 'MECH',
    name: 'Mechanical',
    depth: 0,
    canonicalCount: 1420,
    materialsCount: 125000,
    children: [
      {
        id: 'tax-1-1',
        code: 'MECH-FAST',
        name: 'Fasteners',
        depth: 1,
        canonicalCount: 450,
        materialsCount: 38000,
        children: [
          { id: 'tax-1-1-1', code: 'MECH-FAST-BOLT', name: 'Bolts & Screws', depth: 2, unspscCode: '31161600', canonicalCount: 210, materialsCount: 18500 },
          { id: 'tax-1-1-2', code: 'MECH-FAST-NUT', name: 'Nuts', depth: 2, unspscCode: '31161700', canonicalCount: 140, materialsCount: 11200 },
          { id: 'tax-1-1-3', code: 'MECH-FAST-WSHR', name: 'Washers & Shims', depth: 2, unspscCode: '31161800', canonicalCount: 100, materialsCount: 8300 },
        ]
      },
      {
        id: 'tax-1-2',
        code: 'MECH-BRG',
        name: 'Bearings & Bushings',
        depth: 1,
        canonicalCount: 320,
        materialsCount: 26000,
        children: [
          { id: 'tax-1-2-1', code: 'MECH-BRG-BALL', name: 'Deep Groove Ball Bearings', depth: 2, unspscCode: '31171504', canonicalCount: 180, materialsCount: 14000 },
          { id: 'tax-1-2-2', code: 'MECH-BRG-ROLL', name: 'Roller Bearings', depth: 2, unspscCode: '31171505', canonicalCount: 140, materialsCount: 12000 },
        ]
      },
      {
        id: 'tax-1-3',
        code: 'MECH-PUMP',
        name: 'Pumps & Compressors',
        depth: 1,
        canonicalCount: 290,
        materialsCount: 24500,
        children: [
          { id: 'tax-1-3-1', code: 'MECH-PUMP-CENT', name: 'Centrifugal Pumps', depth: 2, unspscCode: '40151503', canonicalCount: 190, materialsCount: 16000 },
          { id: 'tax-1-3-2', code: 'MECH-PUMP-DISP', name: 'Positive Displacement Pumps', depth: 2, unspscCode: '40151505', canonicalCount: 100, materialsCount: 8500 },
        ]
      }
    ]
  },
  {
    id: 'tax-2',
    code: 'PIPE',
    name: 'Piping & Fittings',
    depth: 0,
    canonicalCount: 1890,
    materialsCount: 168000,
    children: [
      {
        id: 'tax-2-1',
        code: 'PIPE-PIPE',
        name: 'Pipes & Tubes',
        depth: 1,
        canonicalCount: 680,
        materialsCount: 62000,
        children: [
          { id: 'tax-2-1-1', code: 'PIPE-PIPE-SMLS', name: 'Seamless Steel Pipes', depth: 2, unspscCode: '40171512', canonicalCount: 390, materialsCount: 37000 },
          { id: 'tax-2-1-2', code: 'PIPE-PIPE-WELD', name: 'Welded ERW / SAW Pipes', depth: 2, unspscCode: '40171513', canonicalCount: 290, materialsCount: 25000 },
        ]
      },
      {
        id: 'tax-2-2',
        code: 'PIPE-VLV',
        name: 'Valves',
        depth: 1,
        canonicalCount: 710,
        materialsCount: 65000,
        children: [
          { id: 'tax-2-2-1', code: 'PIPE-VLV-BALL', name: 'Ball Valves', depth: 2, unspscCode: '40141607', canonicalCount: 260, materialsCount: 24000 },
          { id: 'tax-2-2-2', code: 'PIPE-VLV-GATE', name: 'Gate Valves', depth: 2, unspscCode: '40141611', canonicalCount: 240, materialsCount: 22000 },
          { id: 'tax-2-2-3', code: 'PIPE-VLV-CHCK', name: 'Check Valves (NRV)', depth: 2, unspscCode: '40141634', canonicalCount: 210, materialsCount: 19000 },
        ]
      },
      {
        id: 'tax-2-3',
        code: 'PIPE-FLG',
        name: 'Flanges & Gaskets',
        depth: 1,
        canonicalCount: 500,
        materialsCount: 41000,
        children: [
          { id: 'tax-2-3-1', code: 'PIPE-FLG-WNRF', name: 'Weld Neck Flanges', depth: 2, unspscCode: '40173302', canonicalCount: 280, materialsCount: 23000 },
          { id: 'tax-2-3-2', code: 'PIPE-FLG-GSKT', name: 'Spiral Wound Gaskets', depth: 2, unspscCode: '31401501', canonicalCount: 220, materialsCount: 18000 },
        ]
      }
    ]
  },
  {
    id: 'tax-3',
    code: 'ELEC',
    name: 'Electrical',
    depth: 0,
    canonicalCount: 1150,
    materialsCount: 104000,
    children: [
      {
        id: 'tax-3-1',
        code: 'ELEC-MOT',
        name: 'Motors & Generators',
        depth: 1,
        canonicalCount: 380,
        materialsCount: 34000,
        children: [
          { id: 'tax-3-1-1', code: 'ELEC-MOT-IND', name: 'Induction Motors', depth: 2, unspscCode: '26101202', canonicalCount: 240, materialsCount: 21000 },
          { id: 'tax-3-1-2', code: 'ELEC-MOT-DC', name: 'DC Motors', depth: 2, unspscCode: '26101201', canonicalCount: 140, materialsCount: 13000 },
        ]
      },
      {
        id: 'tax-3-2',
        code: 'ELEC-CBL',
        name: 'Cables & Conductors',
        depth: 1,
        canonicalCount: 420,
        materialsCount: 39000,
        children: [
          { id: 'tax-3-2-1', code: 'ELEC-CBL-ARM', name: 'Armored Power Cables', depth: 2, unspscCode: '26121629', canonicalCount: 250, materialsCount: 24000 },
          { id: 'tax-3-2-2', code: 'ELEC-CBL-CTRL', name: 'Control & Instrumentation Cables', depth: 2, unspscCode: '26121600', canonicalCount: 170, materialsCount: 15000 },
        ]
      },
      {
        id: 'tax-3-3',
        code: 'ELEC-SWG',
        name: 'Switchgear & Transformers',
        depth: 1,
        canonicalCount: 350,
        materialsCount: 31000,
        children: [
          { id: 'tax-3-3-1', code: 'ELEC-SWG-MCCB', name: 'Circuit Breakers (MCCB/ACB)', depth: 2, unspscCode: '39121601', canonicalCount: 210, materialsCount: 19000 },
          { id: 'tax-3-3-2', code: 'ELEC-SWG-XFRM', name: 'Distribution Transformers', depth: 2, unspscCode: '39121002', canonicalCount: 140, materialsCount: 12000 },
        ]
      }
    ]
  },
  {
    id: 'tax-4',
    code: 'INST',
    name: 'Instrumentation & Control',
    depth: 0,
    canonicalCount: 780,
    materialsCount: 68000,
    children: [
      {
        id: 'tax-4-1',
        code: 'INST-TX',
        name: 'Transmitters & Sensors',
        depth: 1,
        canonicalCount: 410,
        materialsCount: 36000,
        children: [
          { id: 'tax-4-1-1', code: 'INST-TX-PRESS', name: 'Pressure Transmitters', depth: 2, unspscCode: '41112403', canonicalCount: 220, materialsCount: 19000 },
          { id: 'tax-4-1-2', code: 'INST-TX-TEMP', name: 'Temperature Transmitters & RTDs', depth: 2, unspscCode: '41112212', canonicalCount: 190, materialsCount: 17000 },
        ]
      }
    ]
  }
];

export const DEMO_OVERVIEW_STATS: OverviewStats = {
  totalMaterials: 913500,
  processedMaterials: 875200,
  harmonizedMaterials: 748300,
  pendingReviews: 3840,
  potentialDuplicates: 18450,
  unmappedMaterials: 38300,
  canonicalMaterialsCount: 5240,
  overallAccuracyRate: 94.8,
  activeCPSEsCount: 8,
};

export const DEMO_CPSE_STATS: CPSEHarmonizationStat[] = [
  { cpse: 'ONGC', totalMaterials: 142500, harmonized: 121800, pendingReview: 640, duplicates: 3100, accuracyRate: 95.4 },
  { cpse: 'BHEL', totalMaterials: 189200, harmonized: 154700, pendingReview: 820, duplicates: 4200, accuracyRate: 94.1 },
  { cpse: 'NTPC', totalMaterials: 112400, harmonized: 98600, pendingReview: 410, duplicates: 2400, accuracyRate: 96.2 },
  { cpse: 'SAIL', totalMaterials: 165800, harmonized: 132400, pendingReview: 950, duplicates: 3900, accuracyRate: 93.6 },
  { cpse: 'IOCL', totalMaterials: 128900, harmonized: 104500, pendingReview: 530, duplicates: 2750, accuracyRate: 95.1 },
  { cpse: 'GAIL', totalMaterials: 76300, harmonized: 65100, pendingReview: 280, duplicates: 1150, accuracyRate: 96.7 },
  { cpse: 'CIL', totalMaterials: 98400, harmonized: 71200, pendingReview: 210, duplicates: 950, accuracyRate: 92.8 },
];

export const DEMO_CATEGORY_STATS: CategoryStat[] = [
  { category: 'Mechanical', count: 285000, percentage: 31.2, harmonizedCount: 236500 },
  { category: 'Piping & Fittings', count: 242000, percentage: 26.5, harmonizedCount: 205700 },
  { category: 'Electrical', count: 178000, percentage: 19.5, harmonizedCount: 142400 },
  { category: 'Instrumentation & Control', count: 96000, percentage: 10.5, harmonizedCount: 81600 },
  { category: 'Civil & Structural', count: 64000, percentage: 7.0, harmonizedCount: 48000 },
  { category: 'Chemicals & Lubricants', count: 48500, percentage: 5.3, harmonizedCount: 34100 },
];

export const DEMO_MONTHLY_TRENDS: MonthlyProcessingTrend[] = [
  { month: 'Apr 2026', uploaded: 65000, harmonized: 54000, reviewed: 2800 },
  { month: 'May 2026', uploaded: 82000, harmonized: 71000, reviewed: 3200 },
  { month: 'Jun 2026', uploaded: 95000, harmonized: 84000, reviewed: 4100 },
  { month: 'Jul 2026', uploaded: 110000, harmonized: 98000, reviewed: 3900 },
  { month: 'Aug 2026', uploaded: 125000, harmonized: 112000, reviewed: 4400 },
  { month: 'Sep 2026', uploaded: 145000, harmonized: 131000, reviewed: 4800 },
];

export const DEMO_ML_STATUS: MLModelStatus = {
  serviceName: 'CPSE-FastAPI-ML-Microservice',
  status: 'HEALTHY',
  lastHealthCheck: '2026-09-18T15:45:00Z',
  version: 'v2.4.1',
  models: {
    nerModel: {
      name: 'spacy-cpse-materials-ner-v3',
      version: '3.1.2',
      status: 'OPERATIONAL',
      latencyMs: 14.2
    },
    embeddingModel: {
      name: 'sentence-transformers/all-MiniLM-L6-v2',
      version: '2.2.0',
      dimensions: 384,
      latencyMs: 22.8
    },
    classificationModel: {
      name: 'cpse-unspsc-hierarchical-classifier',
      version: '1.8.4',
      status: 'OPERATIONAL',
      latencyMs: 18.5
    },
    vectorIndex: {
      engine: 'HNSW / Faiss Distributed Vector DB',
      totalVectors: 5240,
      status: 'INDEXED & READY'
    }
  },
  metrics: {
    requestsProcessedLast24h: 384920,
    averageLatencyMs: 38.6,
    errorRatePercent: 0.04
  }
};

export const DEMO_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'aud-1',
    timestamp: '2026-09-18T11:42:15Z',
    user: 'Dr. Ananya Iyer',
    employeeId: 'ADM-10021',
    role: 'ADMIN',
    action: 'TAXONOMY_NODE_CREATE',
    entity: 'Taxonomy',
    entityId: 'tax-1-1-3',
    result: 'SUCCESS',
    details: 'Added node: Washers & Shims under Fasteners',
    ipAddress: '10.24.112.5'
  },
  {
    id: 'aud-2',
    timestamp: '2026-09-18T10:15:22Z',
    user: 'Rajesh Sharma',
    employeeId: 'EMP-40892',
    role: 'USER',
    action: 'BATCH_DATA_UPLOAD',
    entity: 'MaterialBatch',
    entityId: 'job-9842',
    result: 'SUCCESS',
    details: 'Uploaded ONGC_Mehsana_Mechanical_Batch_04.csv (4,850 records)',
    ipAddress: '14.139.22.4'
  },
  {
    id: 'aud-3',
    timestamp: '2026-09-17T16:20:10Z',
    user: 'Vikramaditya Sen',
    employeeId: 'REV-20034',
    role: 'REVIEWER',
    action: 'REVIEW_APPROVE',
    entity: 'ReviewItem',
    entityId: 'rev-bhel-9921',
    result: 'SUCCESS',
    details: 'Approved mapping of BHEL-FAST-9921 to Canonical CM-000124',
    ipAddress: '10.45.16.89'
  },
  {
    id: 'aud-4',
    timestamp: '2026-09-17T14:10:05Z',
    user: 'System Scheduler',
    employeeId: 'SYS-CRON',
    role: 'SYSTEM',
    action: 'VECTOR_INDEX_REBUILD',
    entity: 'VectorDB',
    entityId: 'idx-hnsw-cm',
    result: 'SUCCESS',
    details: 'Re-indexed 5,240 canonical embeddings with 0 errors',
    ipAddress: '127.0.0.1'
  },
  {
    id: 'aud-5',
    timestamp: '2026-09-16T09:30:00Z',
    user: 'Rajesh Sharma',
    employeeId: 'EMP-40892',
    role: 'USER',
    action: 'USER_LOGIN',
    entity: 'AuthSession',
    entityId: 'sess-88124',
    result: 'SUCCESS',
    details: 'Authenticated via JWT from ONGC internal gateway',
    ipAddress: '14.139.22.4'
  }
];
