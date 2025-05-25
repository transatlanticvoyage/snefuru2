import { useEffect } from "react";
import { WpCredentials } from "@shared/schema";

interface WordPressConnectionProps {
  credentials: WpCredentials;
  onCredentialsChange: (credentials: WpCredentials) => void;
  onSave: () => void;
}

const WORDPRESS_CREDS_KEY = 'wordpress_credentials';

const WordPressConnection = ({ 
  credentials, 
  onCredentialsChange, 
  onSave 
}: WordPressConnectionProps) => {

  // Load saved credentials on mount
  useEffect(() => {
    const savedCreds = localStorage.getItem(WORDPRESS_CREDS_KEY);
    if (savedCreds) {
      const parsed = JSON.parse(savedCreds);
      onCredentialsChange(parsed);
    }
  }, [onCredentialsChange]);
  
  const handleInputChange = (field: keyof WpCredentials, value: string) => {
    const newCreds = {
      ...credentials,
      [field]: value
    };
    onCredentialsChange(newCreds);
    localStorage.setItem(WORDPRESS_CREDS_KEY, JSON.stringify(newCreds));
  };

  return (
    <section className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-neutral-600 mb-4">Step 4 - WordPress Connection Details (Optional)</h2>
      
      <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 mb-4">
        <h3 className="text-sm font-medium text-yellow-800">Using Application Passwords (Recommended)</h3>
        <p className="text-xs text-yellow-700 mt-1">
          Application Passwords provide better security and reliability. To set up:
        </p>
        <ol className="list-decimal list-inside mt-1 text-xs text-yellow-700 space-y-1 pl-2">
          <li>Go to your WordPress admin: Users → Profile</li>
          <li>Scroll down to "Application Passwords" section</li>
          <li>Name it "Snefuru" and click "Add New"</li>
          <li>Copy the generated password into the field below</li>
        </ol>
      </div>
      
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
            <label htmlFor="wp_application_password" className="block text-sm font-medium text-neutral-500 mb-1">
              Application Password <span className="text-green-600 font-normal text-xs">(Recommended)</span>
            </label>
            <input 
              id="wp_application_password" 
              type="password" 
              className="w-full p-2 border border-green-200 bg-green-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" 
              placeholder="xxxx xxxx xxxx xxxx xxxx xxxx" 
              value={credentials.application_password || ''}
              onChange={(e) => handleInputChange('application_password', e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="wp_login_pass" className="block text-sm font-medium text-neutral-500 mb-1">
              Regular Password <span className="text-neutral-400 font-normal text-xs">(Alternative)</span>
            </label>
            <input 
              id="wp_login_pass" 
              type="password" 
              className="w-full p-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" 
              placeholder="Only use if Application Password isn't available" 
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
