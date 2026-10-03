export function getDefaultProductImage(category?: string): string {
  const categoryImages: { [key: string]: string } = {
    'electronics': 'https://via.placeholder.com/300x200/3498db/ffffff?text=Electronics',
    'clothing': 'https://via.placeholder.com/300x200/e74c3c/ffffff?text=Clothing',
    'home': 'https://via.placeholder.com/300x200/27ae60/ffffff?text=Home+%26+Garden',
    'books': 'https://via.placeholder.com/300x200/f39c12/ffffff?text=Books',
    'sports': 'https://via.placeholder.com/300x200/9b59b6/ffffff?text=Sports',
    'default': 'https://via.placeholder.com/300x200/95a5a6/ffffff?text=Product'
  };
  
  return categoryImages[category?.toLowerCase() || 'default'] || categoryImages['default'];
}

export function getProductImageUrl(product: any): string {
  if (product.imageUrl) {
    return product.imageUrl;
  }
  return getDefaultProductImage(product.category);
}