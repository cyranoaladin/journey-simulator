import { useState } from 'react';
import { generateStableKey } from '../../utils/generateStableKey';

export interface InteractiveTemplateBlock {
  kind: 'interactive_template_block';
  id: string;
  title: string;
  description: string;
  templateType: 'one-pager' | 'pitch-deck' | 'tokenomics' | 'governance' | 'launch-plan';
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'select';
    placeholder?: string;
    options?: string[]; // Pour les champs de type 'select'
  }>;
  agentOwner: string;
}

interface InteractiveTemplateBlockProps {
  readonly block: InteractiveTemplateBlock;
}

export default function InteractiveTemplate({ block }: InteractiveTemplateBlockProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Générer le contenu basé sur les champs remplis
    let content = `# ${block.title}\n\n`;

    if (block.description) {
      content += `${block.description}\n\n`;
    }

    content += "## Input Data:\n\n";

    for (const field of block.fields) {
      const value = formData[field.name] || '';
      content += `**${field.label}**: ${value}\n\n`;
    }

    setGeneratedContent(content);
    setIsSubmitted(true);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedContent], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    // ReplaceAll doesn't work with regex, use replace with global flag for whitespace replacement
    element.download = `${block.title.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(element);
    element.click();
    element.remove();
  };

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold flex items-center">
          <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
          {block.title}
        </h4>
        <span className="text-xs bg-cyan-900/30 text-cyan-300 px-2 py-1 rounded">
          {block.agentOwner}
        </span>
      </div>

      <p className="text-sm opacity-90 mb-4">{block.description}</p>

      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {block.fields.map((field) => {
            const fieldKey = generateStableKey(field, 'template-field', ['name', 'label']);
            return (
              <div key={fieldKey}>
                <label className="block text-sm font-medium mb-1">
                  {field.label}
                  {field.type === 'select' && (
                    <select
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                    >
                      <option value="">Select an option</option>
                      {field.options?.map((option) => {
                        const optionKey = generateStableKey({ value: option }, 'option', ['value']);
                        return (
                          <option key={optionKey} value={option}>{option}</option>
                        );
                      })}
                    </select>
                  )}
                  {field.type === 'textarea' && (
                    <textarea
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full mt-1 px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 min-h-[100px]"
                    />
                  )}
                  {(field.type === 'text' || field.type === 'number') && (
                    <input
                      type={field.type}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full mt-1 px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                    />
                  )}
                </label>
              </div>
            );
          })}

          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 rounded-lg font-medium"
          >
            Generate Template
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="bg-black/30 rounded-lg p-4 border border-white/10">
            <div className="flex justify-between items-center mb-2">
              <h5 className="font-medium">Generated Template</h5>
              <div className="flex space-x-2">
                <button
                  onClick={handleCopyToClipboard}
                  className="text-xs px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded border border-white/10"
                >
                  Copy
                </button>
                <button
                  onClick={handleDownload}
                  className="text-xs px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded border border-white/10"
                >
                  Download
                </button>
              </div>
            </div>
            <pre className="text-xs whitespace-pre-wrap bg-gray-900 p-3 rounded border border-white/10 overflow-x-auto">
              {generatedContent}
            </pre>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => {
                setIsSubmitted(false);
                setGeneratedContent('');
              }}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"
            >
              Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
