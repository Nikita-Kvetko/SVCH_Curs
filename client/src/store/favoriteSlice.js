import { createSlice } from '@reduxjs/toolkit';

const loadFavorites = () => {
  const saved = localStorage.getItem('favoriteFarms');
  return saved ? JSON.parse(saved) : [];
};

const favoriteSlice = createSlice({
  name: 'favorites',
  initialState: {
    favorites: loadFavorites(),
  },
  reducers: {
    toggleFavorite: (state, action) => {
      const farmId = action.payload;
      if (state.favorites.includes(farmId)) {
        state.favorites = state.favorites.filter(id => id !== farmId);
      } else {
        state.favorites.push(farmId);
      }
      localStorage.setItem('favoriteFarms', JSON.stringify(state.favorites));
    },
    isFavorite: (state, action) => {
      return state.favorites.includes(action.payload);
    },
  },
});

export const { toggleFavorite } = favoriteSlice.actions;
export default favoriteSlice.reducer;