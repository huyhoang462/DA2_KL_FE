export const searchService = {
  async getSuggestions(query) {
    return [
      { id: "sg-1", name: "Concert BlackPink" },
      { id: "sg-2", name: "Hội chợ Ẩm thực Sài Gòn" },
      { id: "sg-3", name: "Workshop UI/UX 2025" },
    ].filter((x) => x.name.toLowerCase().includes(query.toLowerCase()));
  },

  async searchEvents({ query, filters, page }) {
    const mockData = Array.from({ length: 20 }).map((_, i) => ({
      id: `p${page}-i${i}-${Math.random()}`,
      name: `Sự kiện mẫu ${i + 1} cho từ khóa: ${query}," id: ${Math.random()}`,
      price: 150000,
      location: "HCM",
      date: "2025-05-01",
    }));

    return {
      items: mockData,
      hasMore: page < 5,
    };
  },
};
