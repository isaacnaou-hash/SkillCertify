const fs = require('fs');
const { execSync } = require('child_process');

// Audio scripts for the three listening comprehension passages
const audioScripts = [
  {
    filename: 'academic-lecture.mp3',
    text: "Good morning everyone. Today we'll examine the relationship between industrial development and environmental sustainability. Recent studies show that carbon emissions have increased by thirty-five percent over the past decade, primarily due to manufacturing and transportation sectors. However, renewable energy initiatives have shown promising results, with solar power efficiency improving by twenty-two percent annually. The key challenge lies in balancing economic growth with environmental protection. Companies must adopt sustainable practices, including waste reduction, energy-efficient technologies, and green supply chain management. Government policies play a crucial role in incentivizing these changes through tax benefits and regulations."
  },
  {
    filename: 'business-presentation.mp3', 
    text: "Thank you for joining today's quarterly review. Our market analysis reveals significant changes in consumer purchasing patterns. Online retail has grown by forty-eight percent, while traditional brick-and-mortar sales declined by fifteen percent. The demographic shift shows that consumers aged twenty-five to forty are driving this digital transformation. Mobile commerce now represents sixty-two percent of all online transactions. To remain competitive, we recommend investing in mobile-first strategies, improving user experience design, and implementing advanced analytics for personalized marketing. Customer retention rates increase by thirty percent when businesses adopt these digital engagement methods."
  },
  {
    filename: 'research-discussion.mp3',
    text: "The primary objective of our research is to evaluate the effectiveness of different teaching methodologies in higher education. We'll use a mixed-methods approach, combining quantitative surveys with qualitative interviews. The sample size includes three hundred participants from various academic departments. Data collection will occur over two semesters to ensure statistical significance. Our hypothesis suggests that interactive learning techniques improve student engagement by approximately twenty-five percent compared to traditional lecture formats. The control group will receive standard instruction, while the experimental group will participate in collaborative projects, case studies, and peer-to-peer learning activities."
  }
];

console.log('Generating professional audio files for English proficiency test...');

// Create text files that will be used to generate audio
audioScripts.forEach((script, index) => {
  const textFile = `client/public/audio/${script.filename.replace('.mp3', '.txt')}`;
  fs.writeFileSync(textFile, script.text);
  console.log(`Created text file: ${textFile}`);
});

console.log('Text files created. Audio files will be generated using system TTS.');
console.log('Note: For production use, consider using professional voice synthesis services.');