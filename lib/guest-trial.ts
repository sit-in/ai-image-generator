/**
 * 游客试用管理
 */

const GUEST_TRIAL_KEY = 'ai_image_guest_trial';
const GUEST_IMAGES_KEY = 'ai_image_guest_images';

export interface GuestTrial {
  hasUsedTrial: boolean;
  trialUsedAt?: string;
  generatedImage?: {
    url: string;
    prompt: string;
    style: string;
    createdAt: string;
  };
}

export interface GuestImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  createdAt: string;
}

export function getGuestTrialStatus(): GuestTrial {
  if (typeof window === 'undefined') {
    return { hasUsedTrial: false };
  }
  
  const data = localStorage.getItem(GUEST_TRIAL_KEY);
  if (!data) {
    return { hasUsedTrial: false };
  }
  
  try {
    return JSON.parse(data);
  } catch {
    return { hasUsedTrial: false };
  }
}

export function setGuestTrialUsed(imageData: {
  url: string;
  prompt: string;
  style: string;
}) {
  if (typeof window === 'undefined') return;
  
  const trial: GuestTrial = {
    hasUsedTrial: true,
    trialUsedAt: new Date().toISOString(),
    generatedImage: {
      ...imageData,
      createdAt: new Date().toISOString()
    }
  };
  
  localStorage.setItem(GUEST_TRIAL_KEY, JSON.stringify(trial));
}

export function saveGuestImage(imageData: {
  url: string;
  prompt: string;
  style: string;
}) {
  if (typeof window === 'undefined') return;
  
  const existingImages = getGuestImages();
  existingImages.push({
    ...imageData,
    createdAt: new Date().toISOString(),
    id: Date.now().toString()
  });
  
  localStorage.setItem(GUEST_IMAGES_KEY, JSON.stringify(existingImages));
}

export function getGuestImages(): GuestImage[] {
  if (typeof window === 'undefined') return [];
  
  const data = localStorage.getItem(GUEST_IMAGES_KEY);
  if (!data) return [];
  
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function clearGuestData() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(GUEST_TRIAL_KEY);
  localStorage.removeItem(GUEST_IMAGES_KEY);
}

// 将游客数据迁移到用户账户
export async function migrateGuestDataToUser(userId: string) {
  const guestImages = getGuestImages();
  const guestTrial = getGuestTrialStatus();
  
  // 如果有试用图片但没有在 guestImages 中，添加进去
  if (guestTrial.generatedImage && guestImages.length === 0) {
    guestImages.push({
      ...guestTrial.generatedImage,
      id: Date.now().toString()
    });
  }
  
  if (guestImages.length === 0) {
    return;
  }
  
  try {
    // 调用 API 将游客数据保存到用户账户
    const response = await fetch('/api/migrate-guest-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        guestImages
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`成功迁移 ${result.migratedCount} 张游客图片`);
      
      // 迁移成功后清理本地数据
      clearGuestData();
      
      return result;
    } else {
      console.error('迁移游客数据失败:', await response.text());
    }
  } catch (error) {
    console.error('迁移游客数据时发生错误:', error);
  }
}