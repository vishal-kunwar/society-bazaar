const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, 'policies');
const outputFile = path.join(__dirname, 'artifacts', 'society-bazaar', 'src', 'pages', 'policies.tsx');

const files = [
  { file: 't&c.txt', componentName: 'TermsAndConditions', title: 'Terms & Conditions' },
  { file: 'refund&cancellation.txt', componentName: 'RefundPolicy', title: 'Refund & Cancellation Policy' },
  { file: 'contact.txt', componentName: 'ContactPolicy', title: 'Contact Us' },
  { file: 'about.txt', componentName: 'AboutPolicy', title: 'About Hustly' },
];

let code = `import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

const PolicyLayout = ({ title, children }: { title: string, children: React.ReactNode }) => {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Navbar
        rightContent={
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
        }
      />
      <main className="container mx-auto px-4 md:px-6 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">{title}</h1>
        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none space-y-4">
          {children}
        </div>
      </main>
    </div>
  );
};
`;

for (const { file, componentName, title } of files) {
  const filePath = path.join(inputDir, file);
  let content = '';
  if (fs.existsSync(filePath)) {
    content = fs.readFileSync(filePath, 'utf-8');
  } else {
    content = 'Content not found.';
  }
  
  if (file === 'about.txt' && !content.trim()) {
    content = 'Welcome to Hustly, a local marketplace that connects buyers with independent home-based businesses and service providers.\n\nOur mission is to empower local entrepreneurs and provide communities with a trusted platform to discover amazing local services and products.\n\nThank you for supporting local businesses!';
  }

  // Replacements
  content = content.replace(/support@hustly\.in/g, 'support.hustly@gmail.com');
  content = content.replace(/\[Date\]/g, 'June 27, 2026');
  
  // Basic markdown-like parsing (paragraphs and lists)
  const paragraphs = content.split('\n\n').map(p => p.trim()).filter(Boolean);
  let jsxContent = paragraphs.map((p, i) => {
    if (p.startsWith('* ')) {
      const items = p.split('\n').filter(l => l.startsWith('* ')).map(l => l.substring(2));
      return `<ul key={${i}} className="list-disc pl-6 space-y-1 mb-4">\n${items.map((item, j) => `          <li key={${j}}>${item}</li>`).join('\n')}\n        </ul>`;
    }
    if (p === '⸻') {
      return `<hr key={${i}} className="my-8 border-border" />`;
    }
    if (p.match(/^\d+\.\s/)) {
        return `<h2 key={${i}} className="text-xl font-semibold mt-8 mb-4">${p}</h2>`;
    }
    // Handle inner newlines
    const lines = p.split('\n').map(l => l.trim()).filter(Boolean);
    return `<p key={${i}} className="leading-relaxed mb-4">\n${lines.map((l, j) => `          {${JSON.stringify(l)}}${j < lines.length - 1 ? ' <br /> ' : ''}`).join('\n')}\n        </p>`;
  }).join('\n        ');

  code += `\nexport function ${componentName}() {\n  return (\n    <PolicyLayout title="${title}">\n        ${jsxContent}\n    </PolicyLayout>\n  );\n}\n`;
}

fs.writeFileSync(outputFile, code);
console.log('Policies generated at ' + outputFile);
