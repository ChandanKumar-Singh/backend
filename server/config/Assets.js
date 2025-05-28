class Assets {
    // ✅ Dynamic Image Imports
    static images = {
        logo: Assets.loadImage('default_user_image.png'),
        // banner: Assets.loadImage('banner/home-banner.jpg'),
    };

    // ✅ Font Management (Can be used in React Native, CSS, or Tailwind)
    static fonts = {
        regular: 'Roboto-Regular',
        bold: 'Roboto-Bold',
        medium: 'Roboto-Medium',
        light: 'Roboto-Light',
    };

    // ✅ SVG Icons (For Webpack & Vite)
    static icons = {
        home: Assets.loadImage('icons/home.svg'),
        profile: Assets.loadImage('icons/profile.svg'),
    };

    // ✅ Videos (For Webpack & Vite)
    static videos = {
        intro: Assets.loadVideo('videos/intro.mp4'),
    };

    // ✅ JSON Files (For Configurations or Mock Data)
    static json = {
        config: Assets.loadJson('config/app-config.json'),
    };

    /**
     * 🔍 Utility to dynamically load images from /public or assets folder.
     */
    static loadImage(filePath) {
        try {
            if (typeof require !== "undefined") {
                return require(`../public/${filePath}`);
            } else {
                return new URL(`../public/${filePath}`, import.meta.url).href;
            }
        } catch (error) {
            console.warn(`❌ Image Not Found: ${filePath}`);
            return '';
        }
    }

    /**
     * 🎥 Utility to dynamically load videos.
     */
    static loadVideo(filePath) {
        try {
            return new URL(`../public/${filePath}`, import.meta.url).href;
        } catch (error) {
            console.warn(`❌ Video Not Found: ${filePath}`);
            return '';
        }
    }

    /**
     * 📄 Utility to load JSON Files (useful for mock data & configs).
     */
    static loadJson(filePath) {
        try {
            return require(`../public/${filePath}`);
        } catch (error) {
            console.warn(`❌ JSON Not Found: ${filePath}`);
            return {};
        }
    }
}

export default Assets;
