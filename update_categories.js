const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'artifacts', 'society-bazaar', 'src');

const newCategoryImages = `const CATEGORY_IMAGES: Record<string, string> = {
  "Food & Tiffin": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
  "Bakery & Sweets": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80",
  "Retail & Daily Needs": "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&q=80",
  "Clothing & Fashion": "https://images.unsplash.com/photo-1489987707023-afc31e4198fa?w=600&q=80",
  "Beauty & Wellness": "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80",
  "Salon at Home": "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=600&q=80",
  "Fitness, Yoga & Zumba": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
  "Tuition & Classes": "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=80",
  "Arts, Music & Hobby Classes": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80",
  "Tailoring & Boutique": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80",
  "Home Services": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
  "Repairs & Maintenance": "https://images.unsplash.com/photo-1416886885375-9e623dc58778?w=600&q=80",
  "Pet Care": "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80",
  "Photography & Events": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80",
  "Gifts & Handmade": "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80",
  "Tech & Digital Services": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80",
  "Travel & Transport": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80",
  "Others": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80",
};`;

function replaceCategoryImages(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  const regex = /const CATEGORY_IMAGES: Record<string, string> = \{[\s\S]*?\n\};\n?/g;
  if (regex.test(content)) {
    content = content.replace(regex, newCategoryImages + '\n\n');
    fs.writeFileSync(filePath, content);
    console.log('Updated ' + filePath);
  }
}

// Update files containing CATEGORY_IMAGES
const filesToUpdate = [
  'pages/favourites.tsx',
  'pages/home.tsx',
  'pages/sell.tsx',
  'pages/business-detail.tsx'
];

filesToUpdate.forEach(f => {
  const fullPath = path.join(srcDir, f);
  if (fs.existsSync(fullPath)) {
    replaceCategoryImages(fullPath);
  }
});

// Now update CATEGORIES in home.tsx specifically to include lucide icons
const homePath = path.join(srcDir, 'pages/home.tsx');
let homeContent = fs.readFileSync(homePath, 'utf-8');

const newCategoriesList = `const CATEGORIES = [
  { name: "Food & Tiffin", icon: Utensils },
  { name: "Bakery & Sweets", icon: Cake },
  { name: "Retail & Daily Needs", icon: ShoppingBag },
  { name: "Clothing & Fashion", icon: Shirt },
  { name: "Beauty & Wellness", icon: Sparkles },
  { name: "Salon at Home", icon: Scissors },
  { name: "Fitness, Yoga & Zumba", icon: Dumbbell },
  { name: "Tuition & Classes", icon: BookOpen },
  { name: "Arts, Music & Hobby Classes", icon: Palette },
  { name: "Tailoring & Boutique", icon: Scissors },
  { name: "Home Services", icon: Wrench },
  { name: "Repairs & Maintenance", icon: Hammer },
  { name: "Pet Care", icon: Dog },
  { name: "Photography & Events", icon: Camera },
  { name: "Gifts & Handmade", icon: Gift },
  { name: "Tech & Digital Services", icon: Monitor },
  { name: "Travel & Transport", icon: Car },
  { name: "Others", icon: Briefcase }
];`;

const categoriesRegex = /const CATEGORIES = \[[\s\S]*?\];\n?/g;
if (categoriesRegex.test(homeContent)) {
  homeContent = homeContent.replace(categoriesRegex, newCategoriesList + '\n');
  
  // Also need to add new icons to lucide-react import
  // Current import looks something like: import { Search, MapPin, Utensils, ... } from "lucide-react";
  const newIcons = ["ShoppingBag", "Shirt", "Palette", "Hammer", "Dog", "Camera", "Gift", "Monitor", "Car", "Briefcase"];
  
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+"lucide-react";/;
  const match = homeContent.match(importRegex);
  if (match) {
    let existingIcons = match[1].split(',').map(i => i.trim());
    newIcons.forEach(icon => {
      if (!existingIcons.includes(icon)) {
        existingIcons.push(icon);
      }
    });
    
    const newImport = `import { ${existingIcons.join(', ')} } from "lucide-react";`;
    homeContent = homeContent.replace(importRegex, newImport);
  }
  
  fs.writeFileSync(homePath, homeContent);
  console.log('Updated CATEGORIES and icons in home.tsx');
}
