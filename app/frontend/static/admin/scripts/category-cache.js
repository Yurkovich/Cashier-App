class CategoryCache {
    constructor() {
        this.categories = null;
        this.lastFetch = null;
        this.fetchPromise = null;
    }

    async getCategories() {
        if (this.categories && this.lastFetch && (Date.now() - this.lastFetch < 30000)) {
            return this.categories;
        }

        if (this.fetchPromise) {
            return this.fetchPromise;
        }

        this.fetchPromise = this.fetchCategories();
        try {
            this.categories = await this.fetchPromise;
            this.lastFetch = Date.now();
            return this.categories;
        } finally {
            this.fetchPromise = null;
        }
    }

    async fetchCategories() {
        try {
            const response = await fetch("/api/categories/nested");
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Ошибка при получении категорий:", error);
            return [];
        }
    }

    async refreshCache() {
        this.categories = null;
        this.lastFetch = null;
        return this.getCategories();
    }
}

const categoryCache = new CategoryCache();
export { categoryCache }; 
