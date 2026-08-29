// ML Submission record — stored in Firestore for training data collection
export interface MLSubmissionRecord {
  submissionId: string;       // Unique ID per run
  playerName: string;
  levelId: number;
  gridRows: number;
  gridCols: number;
  targetWeeks: number;

  // Input features for the neural network (what was placed where)
  // Categorical: 0=Empty, 1=Grass, 2=Sheep on Land, 3=Wolf, 4=Sheep on Grass
  placementMatrix: number[][];

  // 3-channel binary tensor [Grass channel, Sheep channel, Wolf channel]
  // Each channel is rows × cols of 0/1 values
  oneHotGrass: number[][];
  oneHotSheep: number[][];
  oneHotWolf: number[][];

  // Outcome labels (training targets)
  outcome: 'victory' | 'defeat';
  weeksSurvived: number;
  finalAliveSheep: number;
  finalAliveWolves: number;

  // Continuous fitness score S ∈ [0, 100] (regression target)
  // S = 50*(weeksSurvived/targetWeeks) + 30*(finalSheep/budgetSheep) + 10*(finalWolves/budgetWolves) + 10*(victory bonus)
  score: number;

  timestamp: string;
}
