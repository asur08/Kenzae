/**
 * Test script for Multi-Pose AI Draper API
 */

import { processMultiPoseDrape, POSE_DEFINITIONS } from '../api/generate-drape.ts';

console.log('\n--- VERIFYING MULTI-POSE AI DRAPER ENGINE ---\n');

let failed = false;

// 1. Verify 4 Pose Definitions
const requiredPoses = ['hero-front', 'walking-profile', 'pallu-craft', 'seated-heritage'];
for (const p of requiredPoses) {
  if (!POSE_DEFINITIONS[p]) {
    console.error(`❌ Missing pose definition for: ${p}`);
    failed = true;
  } else {
    console.log(`✅ Pose verified: "${POSE_DEFINITIONS[p].title}" (${p}) -> Role: ${POSE_DEFINITIONS[p].role}`);
  }
}

// 2. Test Mock Batch Generation (when GEMINI_API_KEY is not set)
const samplePayload = {
  imageDataUrl: 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==',
  category: 'Saris',
  title: 'Handwoven Banarasi Katan Silk Sari in Wine Plum',
  color: 'Wine Plum & Antique Gold',
  fabricDetails: '100% Pure Mulberry Silk with kadhwa zari',
  modelArchetype: 'kerala-heritage',
  backdrop: 'ivory-atelier',
  drapeStyle: 'nivi',
};

const result = await processMultiPoseDrape(samplePayload, undefined);
if (!result.body.success || result.body.looks.length !== 4) {
  console.error('❌ Failed to generate 4-look lookbook mock:', result.body);
  failed = true;
} else {
  console.log(`✅ Successfully generated full 4-pose editorial lookbook (${result.body.looks.length} looks returned)`);
  result.body.looks.forEach((look, i) => {
    console.log(`   [Look ${i + 1}] ${look.poseId}: ${look.title}`);
  });
}

// 3. Test Single Pose Regeneration
const singlePoseResult = await processMultiPoseDrape(
  { ...samplePayload, pose: 'pallu-craft' },
  undefined
);

if (!singlePoseResult.body.success || singlePoseResult.body.looks.length !== 1 || singlePoseResult.body.looks[0].poseId !== 'pallu-craft') {
  console.error('❌ Failed single pose regeneration test');
  failed = true;
} else {
  console.log('✅ Single-pose targeted regeneration verified (pose: "pallu-craft")');
}

if (failed) {
  console.error('\n❌ AI Draper API tests failed.\n');
  process.exit(1);
} else {
  console.log('\n🎉 ALL MULTI-POSE AI DRAPER TESTS PASSED!\n');
}
