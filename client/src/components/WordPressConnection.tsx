import { WpCredentials } from "@shared/schema";

interface WordPressConnectionProps {
  credentials: WpCredentials;
  onCredentialsChange: (credentials: WpCredentials) => void;
  onSave: () => void;
}

const WordPressConnection = ({ 
  credentials, 
  onCredentialsChange, 
  onSave 
}: WordPressConnectionProps) => {
  
  const handleInputChange = (field: keyof WpCredentials, value: string) => {
    onCredentialsChange({
      ...credentials,
      [field]: value
    });
  };

  return (
    <section className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-neutral-600 mb-4">Step 4 - WordPress Connection Details (Optional)</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="wp_install_url" className="block text-sm font-medium text-neutral-500 mb-1">
              WordPress Site URL
            </label>
            <input 
              id="wp_install_url" 
              type="url" 
              className="w-full p-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" 
              placeholder="https://example.com" 
              value={credentials.url}
              onChange={(e) => handleInputChange('url', e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="wp_login_username" className="block text-sm font-medium text-neutral-500 mb-1">
              Username
            </label>
            <input 
              id="wp_login_username" 
              type="text" 
              className="w-full p-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" 
              placeholder="admin" 
              value={credentials.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="wp_login_pass" className="block text-sm font-medium text-neutral-500 mb-1">
              Password
            </label>
            <input 
              id="wp_login_pass" 
              type="password" 
              className="w-full p-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" 
              placeholder="••••••••" 
              value={credentials.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="wp_post_id" className="block text-sm font-medium text-neutral-500 mb-1">
              Post ID (optional)
            </label>
            <input 
              id="wp_post_id" 
              type="text" 
              className="w-full p-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" 
              placeholder="Leave blank to create new posts" 
              value={credentials.post_id || ''}
              onChange={(e) => handleInputChange('post_id', e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="wpf_pml_id_xunk_img_mapping_key" className="block text-sm font-medium text-neutral-500 mb-1">
              Image Mapping Key (optional)
            </label>
            <input 
              id="wpf_pml_id_xunk_img_mapping_key" 
              type="text" 
              className="w-full p-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" 
              placeholder="Custom field key for mapping" 
              value={credentials.mapping_key || ''}
              onChange={(e) => handleInputChange('mapping_key', e.target.value)}
            />
          </div>
          
          <div className="pt-4">
            <button 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center font-medium"
              onClick={onSave}
            >
              <i className="mdi mdi-content-save mr-2"></i>
              Save WordPress Info
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WordPressConnection;
